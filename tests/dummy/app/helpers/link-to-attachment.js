/* global App */
import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function (attachment) {
    var aTagTemplate = "<a href='%@' target='_blank'>%@</a>",
        url = "%@/%@/%@".fmt(App.Host, attachment.get("_data.db"), attachment.get("id"));
    return new Ember.Handlebars.SafeString(
        aTagTemplate.fmt(url, attachment.get("file_name"))
    );
});
