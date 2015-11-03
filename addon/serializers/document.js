import Ember from "ember";
import DS from "ember-data";
import sharedStore from "../mixins/shared-store";

export default DS.RESTSerializer.extend(sharedStore, {
    isNewSerializerAPI: true,
    primaryKey: "id",
    normalize: function (type, hash, prop) {
        this.normalizeId(hash);
        this.normalizeAttachments(hash, type.modelName);
        this.addHistoryId(hash);
        this.normalizeDoc(hash);
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
        return this._super(type, hash, prop);
    },
    normalizeSingleResponse: function (store, type, payload, id, requestType) {
        return this._super(store, type, payload, id, requestType);
    },
    extractMeta: function (store, type, payload) {
        var result = {};
        if (payload && payload.total_rows && payload.total_pages) {
            result = {
                total_rows: payload.total_rows,
                total_pages: payload.total_pages
            };
            delete payload.total_rows;
            delete payload.total_pages;
        } else if (payload && payload.total_rows) {
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
        hash.history = hash.id + "/history";
        return hash.history;
    },
    normalizeAttachments: function (hash, type) {
        var attachment,
            k,
            key,
            v,
            _attachments = [],
            attachments = hash.doc && hash.doc._attachments || hash._attachments || hash.attachments;
        for (k in attachments) {
            if (attachments.hasOwnProperty(k)) {
                v = attachments[k];
                key = hash.id + "/" + k;
                attachment = {
                    id: key,
                    content_type: v.content_type,
                    digest: v.digest,
                    length: v.length,
                    stub: v.stub,
                    doc_id: hash.id,
                    rev: hash.rev,
                    file_name: k,
                    model_name: type,
                    revpos: v.revpos,
                    db: v.db
                };
                this.addData("attachment", key, attachment);
                _attachments.push(key);
            }
        }
        hash.attachments = _attachments;
        return hash.attachments;
    },
    normalizeId: function (hash) {
        hash.id = hash.doc && hash.doc._id || hash._id || hash.id;
        if (hash.doc && hash.doc._id) {
            delete hash.doc._id;
        }
        if (hash._id) {
            delete hash._id;
        }
        return hash.id;
    },
    normalizeRelationships: function (type, hash) {
        var key = void 0,
            payloadKey = void 0;
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
    normalizeDoc: function (hash) {
        if (hash.doc) {
            Ember.$.each(hash.doc, function (k, v) {
                hash[k] = v;
            });
            delete hash.doc;
        }
        return hash;
    },
    serializeBelongsTo: function (snapshot, json, relationship) {
        var attribute = relationship.options.attribute || "id",
            key = relationship.key,
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
        var attribute = relationship.options.attribute || "id",
            key = relationship.key,
            relationshipType = snapshot.type.determineRelationshipType(relationship, this.get("store")),
            keyArray;
        switch (relationshipType) {
            case "manyToNone":
            case "manyToMany":
            case "manyToOne":
                keyArray = Ember.A(snapshot.hasMany(key));
                json[key] = keyArray.mapBy(attribute);
                return json[key];
        }
    }
});
