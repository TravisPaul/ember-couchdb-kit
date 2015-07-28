import Ember from "ember";
import DS from "ember-data";

export default DS.Adapter.extend({
    sharedStore: Ember.inject.service(),
    find: function (store, type, id) {
        return this.ajax("%@?revs_info=true".fmt(id.split("/")[0]), "GET", {
            context: this
        }, id);
    },
    updateRecord: function (store, type, record) {},
    deleteRecord: function (store, type, record) {},
    ajax: function (url, type, hash, id) {
        return this._ajax("%@/%@".fmt(this.buildURL(), url || ""), type, hash, id);
    },
    _ajax: function (url, type, hash, id) {
        var sharedStore = this.get("sharedStore");
        hash.url = url;
        hash.type = type;
        hash.dataType = "json";
        hash.contentType = "application/json; charset=utf-8";
        hash.context = this;
        if (hash.data && type !== "GET") {
            hash.data = JSON.stringify(hash.data);
        }
        return new Ember.RSVP.Promise(function (resolve, reject) {
            hash.success = function (data) {
                sharedStore.add("revs", id, data);
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
        var host, namespace, url;
        host = Ember.get(this, "host");
        namespace = Ember.get(this, "namespace");
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
