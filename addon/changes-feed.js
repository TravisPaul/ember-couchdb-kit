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
        var _this = this,
            url = Ember.String.fmt("%@%@/_changes?descending=true&limit=1", this._buildUrl(), this.get("db"));
        return Ember.$.ajax({
            url: url,
            dataType: "json",
            success: function (data) {
                _this.set("since", data.last_seq);
                if (callback) {
                    return callback.call(_this);
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
    _ajax: function (callback, self) {
        var _this = this;
        return Ember.$.ajax({
            type: "GET",
            url: this._makeRequestPath(),
            dataType: "json",
            success: function (data) {
                var _ref;
                if (!_this.get("stopTracking")) {
                    if ((data !== null ? (_ref = data.results) !== null ? _ref.length : void 0 : void 0) && callback) {
                        callback.call(self, data.results);
                    }
                    return _this.set("since", data.last_seq);
                }
            },
            complete: function () {
                if (!_this.get("stopTracking")) {
                    return setTimeout((function () {
                        return _this._ajax(callback, self);
                    }), 1000);
                }
            }
        });
    },
    _buildUrl: function () {
        var url;
        url = this.get("host") || "/";
        if (url.substring(url.length - 1) !== "/") {
            url += "/";
        }
        return url;
    },
    _makeRequestPath: function () {
        var feed, params;
        feed = this.feed || "longpool";
        params = this._makeFeedParams();
        return Ember.String.fmt("%@%@/_changes?feed=%@%@", this._buildUrl(), this.get("db"), feed, params);
    },
    _makeFeedParams: function () {
        var path,
            _this = this;
        path = "";
        ["include_docs", "limit", "descending", "heartbeat", "timeout", "filter", "filter_param", "style", "since"].forEach(function (param) {
            if (_this.get(param)) {
                return path += Ember.String.fmt("&%@=%@", param, _this.get(param));
            }
        });
        return path;
    }
});
