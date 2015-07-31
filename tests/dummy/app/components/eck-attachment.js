import Ember from "ember";

export default Ember.Component.extend({
    tagName: "input",
    attributeBindings: ["type", "multiple"],
    type: "file",
    multiple: true,
    change: function (event) {
        this.send("addAttachment", event.target.files, this.get("value"));
    },
    actions: {
        addAttachment: function (files, content) {
            this.set("action", "addAttachment");
            this.sendAction("action", files, content);
        },
        browseFile: function (e) {
            this.$().click();
        }
    }
});
