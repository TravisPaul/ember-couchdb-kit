import Ember from "ember";
import DS from "ember-data";

export default DS.RESTSerializer.extend({
    sharedStore: Ember.inject.service(),
    primaryKey: "id",
    normalize: function (type, hash, prop) {
        this.normalizeRelationships(type, hash);
        return this._super(type, hash, prop);
    },
    extractId: function (type, hash) {
        return hash._id || hash.id;
    },
    normalizeRelationships: function (type, hash) {
        var sharedStore = this.get("sharedStore");
        return type.eachRelationship((function (key, relationship) {
            if (relationship.kind === "belongsTo") {
                hash[key] = sharedStore.mapRevIds("revs", this.extractId(type, hash))[1];
            }
            if (relationship.kind === "hasMany") {
                hash[key] = sharedStore.mapRevIds("revs", this.extractId(type, hash));
                return hash[key];
            }
        }), this);
    }
});
