import Ember from "ember";

export default Ember.Service.extend({
    _data: {},
    add: function (type, key, value) {
        var _data = this.get("_data");
        _data[type + ":" + key] = value;
        return _data[type + ":" + key];
    },
    get: function (type, key) {
        var _data = this.get("_data");
        return _data[type + ":" + key];
    },
    remove: function (type, key) {
        var _data = this.get("_data");
        return delete _data[type + ":" + key];
    },
    mapRevIds: function (type, key) {
        var _this = this;
        return this.get(type, key)._revs_info.map(function (_rev) {
            return "%@/%@".fmt(_this.get(type, key)._id, _rev.rev);
        });
    },
    stopAll: function () {
        var k, v, _results, _data = this.get("_data");
        _results = [];
        for (k in _data) {
            if (_data.hasOwnProperty(k)) {
                v = _data[k];
                if (k.indexOf("changes_worker") === 0) {
                    _results.push(v.stop());
                } else {
                    _results.push(void 0);
                }
            }
        }
        return _results;
    }
});
