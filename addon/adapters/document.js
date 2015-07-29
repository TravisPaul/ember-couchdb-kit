import Ember from "ember";
import DS from "ember-data";
import sharedStore from "../services/shared-store";

export default DS.Adapter.extend({
    sharedStore: sharedStore,
    defaultSerializer: "_default",
    customTypeLookup: false,
    typeViewName: "all",
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
    },
    ajax: function (url, type, normalizeResponse, hash) {
        return this._ajax(Ember.String.fmt("%@/%@", this.buildURL(), url || ""), type, normalizeResponse, hash);
    },
    _ajax: function (url, type, normalizeResponse, hash) {
        var adapter;
        if (hash === null) {
            hash = {};
        }
        adapter = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var headers;
            if (url.split("/").pop() === "") {
                url = url.substr(0, url.length - 1);
            }
            hash.url = url;
            hash.type = type;
            hash.dataType = "json";
            hash.contentType = "application/json; charset=utf-8";
            hash.context = adapter;
            if (hash.data && type !== "GET") {
                hash.data = JSON.stringify(hash.data);
            }
            if (adapter.headers) {
                headers = adapter.headers;
                hash.beforeSend = function (xhr) {
                    return Ember.keys(headers).forEach(function (key) {
                        return xhr.setRequestHeader(key, headers[key]);
                    });
                };
            }
            if (!hash.success) {
                hash.success = function (json) {
                    var _modelJson;
                    _modelJson = normalizeResponse.call(adapter, json);
                    return Ember.run(null, resolve, _modelJson);
                };
            }
            hash.error = function (jqXHR, textStatus, errorThrown) {
                if (jqXHR) {
                    jqXHR.then = null;
                }
                return Ember.run(null, reject, jqXHR);
            };
            return Ember.$.ajax(hash);
        });
    },
    _normalizeRevision: function (json) {
        if (json && json._rev) {
            json.rev = json._rev;
            delete json._rev;
        }
        return json;
    },
    shouldCommit: function (snapshot, relationships) {
        return this._super.apply(arguments);
    },
    // DEPRECATED
    // Find has been deprecated as of Ember Data 1.13. This has been left for backwards compatibility.
    find: function (store, type, id) {
        return this.findRecord(store, type, id);
    },
    findRecord: function (store, type, id) {
        var normalizeResponse;
        if (this._checkForRevision(id)) {
            return this.findWithRev(store, type, id);
        } else {
            normalizeResponse = function (data) {
                var _modelJson;
                this._normalizeRevision(data);
                _modelJson = {};
                _modelJson[type.modelName] = data;
                return _modelJson;
            };
            return this.ajax(id, "GET", normalizeResponse);
        }
    },
    findWithRev: function (store, type, id, hash) {
        var normalizeResponse, url, _id, _ref, _rev;
        _ref = id.split("/").slice(0, 2);
        _id = _ref[0];
        _rev = _ref[1];
        url = Ember.String.fmt("%@?rev=%@", _id, _rev);
        normalizeResponse = function (data) {
            var _modelJson;
            this._normalizeRevision(data);
            _modelJson = {};
            data._id = id;
            _modelJson[type.modelName] = data;
            return _modelJson;
        };
        return this.ajax(url, "GET", normalizeResponse, hash);
    },
    findManyWithRev: function (store, type, ids) {
        var docs, hash, key, self,
            _this = this;
        key = Ember.String.pluralize(type.modelName);
        self = this;
        docs = {};
        docs[key] = [];
        hash = {
            async: false
        };
        ids.forEach(function (id) {
            var url, _id, _ref, _rev;
            _ref = id.split("/").slice(0, 2);
            _id = _ref[0];
            _rev = _ref[1];
            url = Ember.String.fmt("%@?rev=%@", _id, _rev);
            url = Ember.String.fmt("%@/%@", _this.buildURL(), url);
            hash.url = url;
            hash.type = "GET";
            hash.dataType = "json";
            hash.contentType = "application/json; charset=utf-8";
            hash.success = function (json) {
                json._id = id;
                self._normalizeRevision(json);
                return docs[key].push(json);
            };
            return Ember.$.ajax(hash);
        });
        return docs;
    },
    findMany: function (store, type, ids) {
        var data, normalizeResponse;
        if (this._checkForRevision(ids[0])) {
            return this.findManyWithRev(store, type, ids);
        } else {
            data = {
                include_docs: true,
                keys: ids
            };
            normalizeResponse = function (data) {
                var json,
                    _this = this;
                json = {};
                json[Ember.String.pluralize(type.modelName)] = data.rows.map(function (doc) {
                    return _this._normalizeRevision(doc);
                });
                return json;
            };
            return this.ajax("_all_docs?include_docs=true", "POST", normalizeResponse, {
                data: data
            });
        }
    },
    findQuery: function (store, type, query, modelArray) {
        var designDoc, normalizeResponse;
        designDoc = query.designDoc || this.get("designDoc");
        if (!query.options) {
            query.options = {};
        }
        query.options.include_docs = true;
        normalizeResponse = function (data) {
            var json,
                _this = this;
            json = {};
            json[designDoc] = data.rows.getEach("doc").map(function (doc) {
                return _this._normalizeRevision(doc);
            });
            json.total_rows = data.total_rows;
            return json;
        };
        return this.ajax(Ember.String.fmt("_design/%@/_view/%@", designDoc, query.viewName), "GET", normalizeResponse, {
            context: this,
            data: query.options
        });
    },
    findAll: function (store, type) {
        var data, designDoc, normalizeResponse, typeString, typeViewName;
        typeString = Ember.String.singularize(type.modelName);
        designDoc = this.get("designDoc") || typeString;
        typeViewName = this.get("typeViewName");
        normalizeResponse = function (data) {
            var json,
                _this = this;
            json = {};
            json[[Ember.String.pluralize(type.modelName)]] = data.rows.getEach("doc").map(function (doc) {
                return _this._normalizeRevision(doc);
            });
            return json;
        };
        data = {
            include_docs: true,
            key: "\"" + typeString + "\""
        };
        return this.ajax(Ember.String.fmt("_design/%@/_view/%@", designDoc, typeViewName), "GET", normalizeResponse, {
            data: data
        });
    },
    createRecord: function (store, type, snapshot) {
        var json;
        json = store.serializerFor(type.modelName).serialize(snapshot);
        delete json.rev;
        return this._push(store, type, snapshot, json);
    },
    updateRecord: function (store, type, snapshot) {
        var json, snapData;
        json = this.serialize(snapshot, {
            associations: true,
            includeId: true
        });
        snapData = snapshot.record._data;
        if ("attachments" in snapData ? snapData.attachments.length > 0 : void 0) {
            this._updateAttachmnets(snapshot, json);
        }
        delete json.rev;
        return this._push(store, type, snapshot, json);
    },
    deleteRecord: function (store, type, snapshot) {
        return this.ajax(Ember.String.fmt("%@?rev=%@", snapshot.id, snapshot.attr("rev")), "DELETE", (function () {}), {});
    },
    _updateAttachmnets: function (snapshot, json) {
        var _attachments, sharedStore;
        _attachments = {};
        sharedStore = this.get("sharedStore");
        snapshot._hasManyRelationships.attachments.forEach(function (item) {
            var attachment;
            attachment = sharedStore.get("attachment", item.get("id"));
            _attachments[attachment.file_name] = {
                content_type: attachment.content_type,
                digest: attachment.digest,
                length: attachment.length,
                stub: attachment.stub,
                revpos: attachment.revpos
            };
            return _attachments[attachment.file_name];
        });
        json._attachments = _attachments;
        delete json.attachments;
        return delete json.history;
    },
    _checkForRevision: function (id) {
        return id.split("/").length > 1;
    },
    _push: function (store, type, snapshot, json) {
        var id, method, normalizeResponse;
        id = snapshot.id || "";
        method = snapshot.id ? "PUT" : "POST";
        if (snapshot.attr("rev")) {
            json._rev = snapshot.attr("rev");
        }
        normalizeResponse = function (data) {
            var _data, _modelJson;
            _data = json || {};
            this._normalizeRevision(data);
            _modelJson = {};
            _modelJson[type.modelName] = Ember.$.extend(_data, data);
            return _modelJson;
        };
        return this.ajax(id, method, normalizeResponse, {
            data: json
        });
    }
});
