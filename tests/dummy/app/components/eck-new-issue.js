import Ember from "ember";

export default Ember.Component.extend({
    tagName: "form",
    create: false,
    attributeBindings: ["style"],
    style: "display:inline",

    submit: function (event) {
        this._save(event);
    },

    keyDown: function (event) {
        if (event.keyCode === 13) {
            this._save(event);
        }
    },

    _save: function (event) {
        var text;
        event.preventDefault();
        if (this.get("create")) {
            text = this.get("TextArea.value");
            if (!Ember.isEmpty(text)) {
                this.get("controller").send("createIssue", text);
            }
        }
        this.toggleProperty("create");
    }
});
