import Ember from "ember";

export default Ember.Helper.extend({
    globals: Ember.inject.service(),
    compute(params) {
        var aTagTemplate = "<a href='%@' target='_blank'>%@</a>",
            url = Ember.String.fmt("%@/%@/%@", this.get("globals").get("host"), params[0].get("db"), params[0].get("id")),
            paramsLoadingPromise = new Promise(function (resolve, reject) {
                var count = 0,
                    repeat = function () {
                        if (count < 20) {
                            window.setTimeout(function () {
                                if (params[0].currentState.isLoading) {
                                    count += 1;
                                    repeat();
                                } else {
                                    resolve(Ember.String.htmlSafe(Ember.String.fmt(aTagTemplate, url, params[0].get("file_name"))));
                                }
                            }, 50);
                        } else {
                            reject();
                        }
                    };
                repeat();
            }),
            htmlString;
        if (params[0].currentState.isLoading) {
            return paramsLoadingPromise.then(function (string) {
                return string;
            });
        } else {
            return Ember.String.htmlSafe(Ember.String.fmt(aTagTemplate, url, params[0].get("file_name")));
        }
    }
});
