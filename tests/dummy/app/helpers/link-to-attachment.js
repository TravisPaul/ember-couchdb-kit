import Ember from "ember";

export default Ember.Helper.extend({
    globals: Ember.inject.service(),
    compute(params) {
        var aTagTemplate = "<a href='%@' target='_blank'>%@</a>",
            globals = this.get("globals"),
            url = Ember.String.fmt("%@/%@/%@", globals.get("host"), globals.get("db"), params[0].get("id")),
            self = this;
        if (params[0].get("isLoading")) {
            params[0]._internalModel._loadingPromise.then(function () {
                self.recompute();
            });
        }
        return Ember.String.htmlSafe(Ember.String.fmt(aTagTemplate, url, params[0].get("file_name")));
    }
});
