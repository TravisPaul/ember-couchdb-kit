import Ember from "ember";

export default Ember.Component.extend({
    tagName: "form",
    create: false,
    attributeBindings: ["style"],
    style: Ember.Handlebars.SafeString("display:inline"),

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
            text = this.get("childViews")[0].element.value;
            if (!Ember.isEmpty(text)) {
                this.send("createNewIssue", text);
            }
        }
        this.toggleProperty("create");
    },
    actions: {
        createNewIssue: function (text) {
            this.set("action", "createIssue");
            this.sendAction("action", text);
        },
        setCreateIssue: function (val) {
            this.set("create", val);
        }
    }
});
