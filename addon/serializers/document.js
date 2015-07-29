import Ember from "ember";
import DS from "ember-data";
import sharedStore from "../services/shared-store";

export default DS.RESTSerializer.extend({
    isNewSerializerAPI: true,
    sharedStore: sharedStore,
    primaryKey: "_id",
    normalize: function (type, hash, prop) {
        this.normalizeId(hash);
        this.normalizeAttachments(hash._attachments, type.modelName, hash);
        this.addHistoryId(hash);
        this.normalizeUsingDeclaredMapping(type, hash);
        this.normalizeAttributes(type, hash);
        this.normalizeRelationships(type, hash);
        if (this.normalizeHash && this.normalizeHash[prop]) {
            return this.normalizeHash[prop](hash);
        }
        if (!hash) {
            return hash;
        }
        this.applyTransforms(type, hash);
        return hash;
    },
    normalizeSingleResponse: function (store, type, payload, id, requestType) {
        return this._super(store, type, payload, id, requestType);
    },
    extractMeta: function (store, type, payload) {
        var result = {};
        if (payload && payload.total_rows) {
            result = {
                total_rows: payload.total_rows
            };
            delete payload.total_rows;
        }
        return result;
    },
    serialize: function (snapshot, options) {
        return this._super(snapshot, options);
    },
    addHistoryId: function (hash) {
        hash.history = Ember.String.fmt("%@/history", hash.id);
        return hash.history;
    },
    normalizeAttachments: function (attachments, type, hash) {
        var attachment, k, key, v, _attachments;
        _attachments = [];
        for (k in attachments) {
            if (attachments.hasOwnProperty(k)) {
                v = attachments[k];
                key = hash._id + "/" + k;
                attachment = {
                    id: key,
                    content_type: v.content_type,
                    digest: v.digest,
                    length: v.length,
                    stub: v.stub,
                    doc_id: hash._id,
                    rev: hash.rev,
                    file_name: k,
                    model_name: type,
                    revpos: v.revpos,
                    db: v.db
                };
                this.get("sharedStore").add("attachment", key, attachment);
                _attachments.push(key);
            }
        }
        hash.attachments = _attachments;
        return hash.attachments;
    },
    normalizeId: function (hash) {
        hash.id = hash._id || hash.id;
        return hash.id;
    },
    normalizeRelationships: function (type, hash) {
        var key, payloadKey;
        payloadKey = void 0;
        key = void 0;
        if (this.keyForRelationship) {
            return type.eachRelationship((function (key, relationship) {
                payloadKey = this.keyForRelationship(key, relationship.kind);
                if (key === payloadKey) {
                    return;
                }
                hash[key] = hash[payloadKey];
                return delete hash[payloadKey];
            }), this);
        }
    },
    serializeBelongsTo: function (snapshot, json, relationship) {
        var attribute, belongsTo, key;
        attribute = relationship.options.attribute || "id";
        key = relationship.key;
        belongsTo = snapshot.belongsTo(key);
        if (Ember.isNone(belongsTo)) {
            return;
        }
        json[key] = attribute === "id" ? belongsTo.id : belongsTo.attr(attribute);
        if (relationship.options.polymorphic) {
            json[key + "_type"] = belongsTo.modelName;
            return json[key + "_type"];
        }
    },
    serializeHasMany: function (snapshot, json, relationship) {
        var attribute, key, relationshipType;
        attribute = relationship.options.attribute || "id";
        key = relationship.key;
        relationshipType = snapshot.type.determineRelationshipType(relationship);
        switch (relationshipType) {
            case "manyToNone":
            case "manyToMany":
            case "manyToOne":
                json[key] = snapshot.hasMany(key).mapBy(attribute);
                return json[key];
        }
    }
});
