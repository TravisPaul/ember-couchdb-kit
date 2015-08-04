import Ember from "ember";

export default Ember.Component.extend({
    tagName: "button",
    classNames: ["btn", "btn-xs", "btn-danger"],

    click: function (event) {
        event.preventDefault();
        this.send("deleteIssue", this.get("value"));
    },
    actions: {
        deleteIssue: function (value) {
            this.set("action", "deleteIssue");
            this.sendAction("action", value);
        }
    }
});
