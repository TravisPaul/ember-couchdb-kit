import Ember from "ember";

export default Ember.ObjectProxy.extend({
    content: {},
    longpoll: function () {
        this.feed = "longpoll";
        return this._ajax.apply(this, arguments);
    },
    normal: function () {
        this.feed = "normal";
        return this._ajax.apply(this, arguments);
    },
    continuous: function () {
        this.feed = "continuous";
        return this._ajax.apply(this, arguments);
    },
    fromTail: function (callback) {
        var self = this,
            url = this._buildUrl() + this.get("db") + "/_changes?descending=true&limit=1";
        return Ember.$.ajax({
            url: url,
            dataType: "json",
            success: function (data) {
                self.set("since", data.last_seq);
                if (callback) {
                    return callback.call(self);
                }
            }
        });
    },
    stop: function () {
        this.set("stopTracking", true);
        return this;
    },
    start: function (callback) {
        this.set("stopTracking", false);
        return this.fromTail(callback);
    },
    _ajax: function (callback, args) {
        var self = this;
        return Ember.$.ajax({
            type: "GET",
            url: this._makeRequestPath(),
            dataType: "json",
            success: function (data) {
                var _ref;
                if (!self.get("stopTracking")) {
                    if ((data !== null ? (_ref = data.results) !== null ? _ref.length : void 0 : void 0) && callback) {
                        callback.call(args, data.results);
                    }
                    return self.set("since", data.last_seq);
                }
            },
            complete: function () {
                if (!self.get("stopTracking")) {
                    return setTimeout((function () {
                        return self._ajax(callback, args);
                    }), 1000);
                }
            }
        });
    },
    _buildUrl: function () {
        var url = this.get("host") || "/";
        if (url.substring(url.length - 1) !== "/") {
            url += "/";
        }
        return url;
    },
    _makeRequestPath: function () {
        var feed = this.feed || "longpool",
            params = this._makeFeedParams();
        return this._buildUrl() + this.get("db") + "/_changes?feed=" + feed + params;
    },
    _makeFeedParams: function () {
        var path = "",
            self = this;
        ["include_docs", "limit", "descending", "heartbeat", "timeout", "filter", "filter_param", "style", "since"].forEach(function (param) {
            if (self.get(param)) {
                return path += "&" + param + "=" + self.get(param);
            }
        });
        return path;
    }
});
