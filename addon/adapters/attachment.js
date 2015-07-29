import Ember from "ember";
import DS from "ember-data";
import sharedStore from "../services/shared-store";

export default DS.Adapter.extend({
    sharedStore: sharedStore,
    find: function (store, type, id) {
        var sharedStore = this.get("sharedStore");
        return new Ember.RSVP.Promise(function (resolve, reject) {
            return Ember.run(null, resolve, {
                attachment: sharedStore.get("attachment", id)
            });
        });
    },
    findMany: function (store, type, ids) {
        var docs,
            _this = this;
        docs = ids.map(function (item) {
            item = _this.get("sharedStore").get("attachment", item);
            item.db = _this.get("db");
            return item;
        });
        return new Ember.RSVP.Promise(function (resolve, reject) {
            return Ember.run(null, resolve, {
                attachments: docs
            });
        });
    },
    createRecord: function (store, type, record) {
        var adapter, url;
        url = Ember.String.fmt("%@/%@?rev=%@", this.buildURL(), record.get("id"), record.get("rev"));
        adapter = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var data, request,
                _this = this;
            data = {};
            data.context = adapter;
            request = new window.XMLHttpRequest();
            request.open("PUT", url, true);
            request.setRequestHeader("Content-Type", record.get("content_type"));
            adapter._updateUploadState(record, request);
            request.onreadystatechange = function () {
                var json;
                if (request.readyState === 4 && (request.status === 201 || request.status === 200)) {
                    data = JSON.parse(request.response);
                    data.model_name = record.get("model_name");
                    data.doc_id = record.get("doc_id");
                    json = adapter.serialize(record, {
                        includeId: true
                    });
                    delete data.id;
                    return Ember.run(null, resolve, {
                        attachment: Ember.$.extend(json, data)
                    });
                }
            };
            return request.send(record.get("file"));
        });
    },
    updateRecord: function (store, type, record) {},
    deleteRecord: function (store, type, record) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            return Ember.run(null, resolve, {});
        });
    },
    _updateUploadState: function (record, request) {
        var view,
            _this = this;
        view = record.get("view");
        if (view) {
            view.startUpload();
            request.onprogress = function (oEvent) {
                var percentComplete;
                if (oEvent.lengthComputable) {
                    percentComplete = oEvent.loaded / oEvent.total * 100;
                    return view.updateUpload(percentComplete);
                }
            };
            return request.onprogress;
        }
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
