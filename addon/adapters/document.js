import Ember from "ember";
import DS from "ember-data";
import sharedStore from "../mixins/shared-store";

export default DS.Adapter.extend(sharedStore, {
    defaultSerializer: "_default",
    customTypeLookup: false,
    typeViewName: "all",
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
    },
    ajax: function (url, type, normalizeResponse, hash) {
        return this._ajax(this.buildURL() + "/" + url || "", type, normalizeResponse, hash);
    },
    _ajax: function (url, type, normalizeResponse, hash) {
        var adapter = this;
        if (!hash) {
            hash = {};
        }
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
                    var _modelJson = normalizeResponse.call(adapter, json);
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
        } else {
            if (json && json.doc && json.doc._rev) {
                json.rev = json.doc._rev;
                delete json.doc._rev;
            }
        }
        return json;
    },
    shouldCommit: function (snapshot, relationships) {
        return this._super.apply(arguments);
    },
    // DEPRECATED
    // find has been deprecated as of Ember Data 1.13. This has been left for backwards compatibility.
    find: function (store, type, id) {
        return this.findRecord(store, type, id);
    },
    findRecord: function (store, type, id) {
        var normalizeResponse;
        if (this._checkForRevision(id)) {
            return this.findWithRev(store, type, id);
        } else {
            normalizeResponse = function (data) {
                var _modelJson = {};
                this._normalizeRevision(data);
                _modelJson[type.modelName] = data;
                return _modelJson;
            };
            return this.ajax(id, "GET", normalizeResponse);
        }
    },
    findWithRev: function (store, type, id, hash) {
        var normalizeResponse,
            _ref = id.split("/").slice(0, 2),
            _id = _ref[0],
            _rev = _ref[1],
            url = _id + "?rev=" + _rev;
        normalizeResponse = function (data) {
            var _modelJson = {};
            this._normalizeRevision(data);
            data._id = id;
            _modelJson[type.modelName] = data;
            return _modelJson;
        };
        return this.ajax(url, "GET", normalizeResponse, hash);
    },
    findManyWithRev: function (store, type, ids) {
        var docs = {},
            hash = {
                async: false
            },
            key = Ember.String.pluralize(type.modelName),
            self = this;
        docs[key] = [];
        ids.forEach(function (id) {
            var _ref = id.split("/").slice(0, 2),
                _id = _ref[0],
                _rev = _ref[1],
                url = _id + "?rev=" + _rev;
            url = self.buildURL() + "/" + url;
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
        var data,
            normalizeResponse;
        if (ids.length && this._checkForRevision(ids[0])) {
            return this.findManyWithRev(store, type, ids);
        } else {
            data = {
                include_docs: true,
                keys: ids
            };
            normalizeResponse = function (data) {
                var json,
                    self = this;
                json = {};
                json[Ember.String.pluralize(type.modelName)] = data.rows.map(function (doc) {
                    return self._normalizeRevision(doc);
                });
                return json;
            };
            return this.ajax("_all_docs?include_docs=true", "POST", normalizeResponse, {
                data: data
            });
        }
    },
    // DEPRECATED
    // findQuery has been deprecated as of Ember Data 1.13. This has been left for backwards compatibility.
    findQuery: function (store, type, query) {
        return this.query(store, type, query);
    },
    query: function (store, type, query) {
        var designDoc, normalizeResponse;
        designDoc = query.designDoc || this.get("designDoc");
        if (query.ids) {
            return this.findMany(store, type, query.ids);
        }
        if (!query.options) {
            query.options = {};
        }
        query.options.include_docs = true;
        normalizeResponse = function (data) {
            var json,
                self = this;
            json = {};
            json[designDoc] = data.rows.getEach("doc").map(function (doc) {
                return self._normalizeRevision(doc);
            });
            json.total_rows = data.total_rows;
            if (query.options.limit) {
                json.total_pages = Math.ceil(data.total_rows / query.options.limit);
            }
            return json;
        };
        return this.ajax("_design/" + designDoc + "/_view/" + query.viewName, "GET", normalizeResponse, {
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
                self = this;
            json = {};
            json[[Ember.String.pluralize(type.modelName)]] = data.rows.getEach("doc").map(function (doc) {
                return self._normalizeRevision(doc);
            });
            return json;
        };
        data = {
            include_docs: true,
            key: "\"" + typeString + "\""
        };
        return this.ajax("_design/" + designDoc + "/_view/" + typeViewName, "GET", normalizeResponse, {
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
        snapData = snapshot.record;
        if ("attachments" in snapData ? snapData.get("attachments").get("length") > 0 : void 0) {
            this._updateAttachmnets(snapshot, json);
        }
        delete json.id;
        delete json.rev;
        return this._push(store, type, snapshot, json);
    },
    deleteRecord: function (store, type, snapshot) {
        return this.ajax(snapshot.id + "?rev=" + snapshot.attr("rev"), "DELETE", (function () {}), {});
    },
    _updateAttachmnets: function (snapshot, json) {
        var _attachments,
            self = this;
        _attachments = {};
        snapshot._hasManyRelationships.attachments.forEach(function (item) {
            var attachment;
            attachment = self.getData("attachment", item.id);
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
        if (snapshot._attributes.rev) {
            json._rev = snapshot.attr("rev");
        }
        if (json.attachments) {
            delete json.attachments;
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
    },
    shouldBackgroundReloadRecord: function (store, snapshot) {
        // We don"t ever want to background reload a new record do we?
        return !snapshot.record.get("isNew");
    }
});
