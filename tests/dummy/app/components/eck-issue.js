import Ember from "ember";

export default Ember.Component.extend({
    tagName: "form",
    edit: false,
    attributeBindings: ["draggable"],
    draggable: "true",

    submit: function (event) {
        event.preventDefault();
        if (this.get("edit")) {
            this.get("controller").send("saveIssue", this.get("context"));
        }
        this.toggleProperty("edit");
    },

    dragStart: function (event) {
        event.dataTransfer.setData("id", this.get("elementId"));
    },

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
        var view = Ember.View.views[event.dataTransfer.getData("id")];
        if (this.draggable === "true" || view.draggable === "true") {
            this.get("controller").send("dropIssue", view.get("controller"), view.get("context"), this.get("context"));
        }
        event.preventDefault();
        event.target.style.opacity = "1";
    }
});
