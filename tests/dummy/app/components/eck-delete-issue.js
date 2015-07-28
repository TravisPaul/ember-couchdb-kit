import Ember from "ember";

export default Ember.Component.extend({
    tagName: "button",
    classNames: ["btn", "btn-xs", "btn-danger"],

    click: function (event) {
        event.preventDefault();
        this.get("controller").send("deleteIssue", this.get("context"));
    }
});
