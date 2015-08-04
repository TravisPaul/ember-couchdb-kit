import Ember from "ember";

export default Ember.Helper.extend({
    globals: Ember.inject.service(),
    compute(params) {
        var globals = this.get("globals"),
            url = globals.get("host") + "/" + globals.get("db") + "/" + params[0].get("id"),
            self = this;
        if (params[0].get("isLoading")) {
            params[0]._internalModel._loadingPromise.then(function () {
                self.recompute();
            });
        }
        return Ember.String.htmlSafe("<a href='" + url + "' target='_blank'>" + params[0].get("file_name") + "</a>");
    }
});

