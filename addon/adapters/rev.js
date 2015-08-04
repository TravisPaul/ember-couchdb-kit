import Ember from "ember";
import DS from "ember-data";
import sharedStore from "../mixins/shared-store";

export default DS.Adapter.extend(sharedStore, {
    // DEPRECATED
    // Find has been deprecated as of Ember Data 1.13. This has been left for backwards compatibility.
    find: function (store, type, id) {
        return this.findRecord(store, type, id);
    },
    findRecord: function (store, type, id) {
        return this.ajax(id.split("/")[0] + "?revs_info=true", "GET", {
            context: this
        }, id);
    },
    updateRecord: function (store, type, snapshot) {},
    deleteRecord: function (store, type, snapshot) {},
    ajax: function (url, type, hash, id) {
        return this._ajax(this.buildURL() + "/" + url || "", type, hash, id);
    },
    _ajax: function (url, type, hash, id) {
        hash.url = url;
        hash.type = type;
        hash.dataType = "json";
        hash.contentType = "application/json; charset=utf-8";
        hash.context = this;
        if (hash.data && type !== "GET") {
            hash.data = JSON.stringify(hash.data);
        }
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var self = this;
            hash.success = function (data) {
                self.addData("revs", id, data);
                return Ember.run(null, resolve, {
                    history: {
                        id: id
                    }
                });
            };
            return Ember.$.ajax(hash);
        });
    },
    buildURL: function () {
        var host = Ember.get(this, "host"),
            namespace = Ember.get(this, "namespace"),
            url = [];
        if (host) {
            url.push(host);
        }
        if (namespace) {
            url.push(namespace);
        }
        url.push(this.get("db"));
        url = url.join("/");
        if (!host) {
            url = "/" + url;
        }
        return url;
    }
});
