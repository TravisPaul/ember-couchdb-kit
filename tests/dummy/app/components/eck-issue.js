import Ember from "ember";
import ListGroupItemComponent from "dummy/components/list-group-item";

export default ListGroupItemComponent.extend({
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
        this.get("dragHelper").set("component", this);
    },

    actions: {
        saveIssue: function (value, text) {
            this.set("action", "saveIssue");
            value.set("text", text);
            this.sendAction("action", value);
        },
        deleteIssue: function (value) {
            this.set("action", "deleteIssue");
            this.sendAction("action", value);
        },
        addAttachment: function (files, content) {
            this.set("action", "addAttachment");
            this.sendAction("action", files, content);
        },
        deleteAttachment: function (value) {
            this.set("action", "deleteAttachment");
            this.sendAction("action", value);
        }
    }
});
