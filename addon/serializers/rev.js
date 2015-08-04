import Ember from "ember";
import DS from "ember-data";
import sharedStore from "../mixins/shared-store";

export default DS.RESTSerializer.extend(sharedStore, {
    isNewSerializerAPI: true,
    primaryKey: "id",
    normalize: function (type, hash, prop) {
        this.extractRelationships(type, hash);
        return this._super(type, hash, prop);
    },
    extractId: function (type, hash) {
        return hash._id || hash.id;
    },
    extractRelationships: function (type, hash) {
        var self = this;
        return type.eachRelationship((function (key, relationship) {
            if (relationship.kind === "belongsTo") {
                hash[key] = self.mapRevIds("revs", this.extractId(type, hash))[1];
            }
            if (relationship.kind === "hasMany") {
                hash[key] = self.mapRevIds("revs", this.extractId(type, hash));
                return hash[key];
            }
        }), this);
    }
});
