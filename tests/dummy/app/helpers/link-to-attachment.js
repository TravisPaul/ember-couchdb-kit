import Ember from "ember";

export default Ember.Helper.extend({
    globals: Ember.inject.service(),
    compute(params) {
        var aTagTemplate = "<a href='%@' target='_blank'>%@</a>",
            url = Ember.String.fmt("%@/%@/%@", this.get("globals").get("host"), params[0].get("db"), params[0].get("id"));
        return Ember.String.htmlSafe(Ember.String.fmt(aTagTemplate, url, params[0].get("file_name")));
    }
});
