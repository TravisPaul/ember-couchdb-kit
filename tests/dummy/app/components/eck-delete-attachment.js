import Ember from "ember";

export default Ember.Component.extend({
    tagName: "span",
    classNames: ["badge"],

    click: function (event) {
        event.preventDefault();
        this.send("deleteAttachment", this.get("value"));
    },

    actions: {
        deleteAttachment: function (value) {
            this.set("action", "deleteAttachment");
            this.sendAction("action", value);
        }
    }
});
