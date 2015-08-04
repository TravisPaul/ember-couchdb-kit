import Ember from "ember";

export default Ember.Component.extend({
    tagName: "span",
    classNames: ["badge"],

    click: function (event) {
        event.preventDefault();
        this.send("deleteAttachment", this.get("value"), this.get("issue"));
    },

    actions: {
        deleteAttachment: function (value, issue) {
            this.set("action", "deleteAttachment");
            this.sendAction("action", value, issue);
        }
    }
});
