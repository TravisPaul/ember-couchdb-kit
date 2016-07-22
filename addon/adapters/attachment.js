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
        var self = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            return Ember.run(null, resolve, {
                attachment: self.getData("attachment", id)
            });
        });
    },
    findMany: function (store, type, ids) {
        var docs,
            self = this;
        docs = ids.map(function (item) {
            item = self.getData("attachment", item);
            item.db = self.get("db");
            return item;
        });
        return new Ember.RSVP.Promise(function (resolve, reject) {
            return Ember.run(null, resolve, {
                attachments: docs
            });
        });
    },
    createRecord: function (store, type, snapshot) {
        var adapter = this,
            url = this.buildURL() + "/" + snapshot.record.get("id") + "?rev=" + snapshot.record.get("rev"),
            self = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var data = {},
                request = new window.XMLHttpRequest();
            data.context = adapter;
            request.open("PUT", url, true);
            request.setRequestHeader("Content-Type", snapshot.attr("content_type"));
            adapter._updateUploadState(snapshot, request);
            request.onreadystatechange = function () {
                var json,
                    attObj,
                    head = new window.XMLHttpRequest(),
                    headUrlArray = url.split("?");
                if (request.readyState === 4 && (request.status === 201 || request.status === 200)) {
                    data = JSON.parse(request.response);
                    data.model_name = snapshot.record.model_name;
                    data.doc_id = snapshot.record.doc_id;
                    json = adapter.serialize(snapshot, {
                        includeId: true
                    });
                    delete data.id;
                    attObj = Ember.$.extend(json, data);
                    head.open("HEAD", headUrlArray[0] + "?rev=" + data.rev, true);
                    head.onreadystatechange = function () {
                        var md5,
                            revposArray = data.rev.split("-"),
                            revpos = parseInt(revposArray, 10);
                        if (head.readyState === 4 && (head.status === 201 || head.status === 200)) {
                            md5 = "md5-" + head.getResponseHeader("Content-MD5");
                            self.addData("attachment", json.id, Ember.$.extend(attObj, {stub: true, digest: md5, revpos: revpos}));
                            return Ember.run(null, resolve, {
                                attachment: attObj
                            });
                        }
                    };
                    return head.send();
                }
            };
            return request.send(snapshot.record.file);
        });
    },
    updateRecord: function (store, type, snapshot) {},
    deleteRecord: function (store, type, snapshot) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            return Ember.run(null, resolve, {});
        });
    },
    _updateUploadState: function (snapshot, request) {
        var view = snapshot._attributes.view,
            self = this;
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
