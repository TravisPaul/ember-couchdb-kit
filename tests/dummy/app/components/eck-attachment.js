import Ember from "ember";

export default Ember.Component.extend({
    tagName: "input",
    attributeBindings: ["style", "type", "multiple"],
    style: Ember.Handlebars.SafeString("display:none"),
    type: "file",
    multiple: true,

    actions: {
        browseFile: function (e) {
            this.$().click();
        }
    },

    change: function (event) {
        this.get("controller").send("addAttachment", event.target.files, this.get("context"));
    }
});
