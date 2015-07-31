import Ember from "ember";

export default Ember.Component.extend({
    tagName: "form",
    edit: false,
    attributeBindings: ["draggable"],
    draggable: "true",

    submit: function (event) {
        event.preventDefault();
        if (this.get("edit")) {
            this.send("saveIssue", this.get("value"));
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
            this.send("dropIssue", view.get("controller"), view.get("value"), this.get("value"));
        }
        event.preventDefault();
        event.target.style.opacity = "1";
    },

    actions: {
        saveIssue: function (value) {
            this.set("action", "saveIssue");
            this.sendAction("action", value);
        },
        dropIssue: function (controller, oldModel, newModel) {
            this.set("action", "dropIssue");
            this.sendAction("action", controller, oldModel, newModel);
        },
        deleteIssue: function (value) {
            this.set("action", "deleteIssue");
            this.sendAction("action", value);
        }
    }
});
