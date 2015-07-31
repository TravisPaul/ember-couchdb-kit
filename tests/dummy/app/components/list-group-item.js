import Ember from "ember";

export default Ember.Component.extend({
    dragHelper: Ember.inject.service(),
    tagName: "li",

    dragEnter: function (event) {
        event.preventDefault();
        event.target.style.opacity = "0.4";
    },

    dragOver: function (event) {
        event.preventDefault();
    },

    dragLeave: function (event) {
        event.preventDefault();
        event.target.style.opacity = "1";
    },

    drop: function (event) {
        var component = this.get("dragHelper").get("component");
        if (this.draggable === "true" || component.draggable === "true") {
            this.send("dropIssue", component._controller, component.get("content"), this.get("content"));
        }
        event.preventDefault();
        event.target.style.opacity = "1";
    },

    actions: {
        dropIssue: function (controller, oldModel, newModel) {
            this.set("action", "dropIssue");
            this.sendAction("action", controller, oldModel, newModel);
        }
    }
});
