import Ember from "ember";

export default Ember.Component.extend({
    tagName: "form",
    edit: false,
    attributeBindings: ["draggable"],
    draggable: "true",

    submit: function (event) {
        event.preventDefault();
        var text;
        if (this.get("edit")) {
            text = this.get("childViews")[0].element.value;
            if (text === "") {
                this.send("deleteIssue", this.get("content"));
            } else {
                this.send("saveIssue", this.get("content"), text);
            }
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
            this.send("dropIssue", view.get("controller"), view.get("content"), this.get("content"));
        }
        event.preventDefault();
        event.target.style.opacity = "1";
    },

    actions: {
        saveIssue: function (value, text) {
            this.set("action", "saveIssue");
            value.set("text", text);
            this.sendAction("action", value);
        },
        dropIssue: function (controller, oldModel, newModel) {
            this.set("action", "dropIssue");
            this.sendAction("action", controller, oldModel, newModel);
        },
        deleteIssue: function (value) {
            this.set("action", "deleteIssue");
            this.sendAction("action", value);
        },
        addAttachment: function (files, content) {
            this.set("action", "addAttachment");
            this.sendAction("action", files, content);
        },
    }
});
