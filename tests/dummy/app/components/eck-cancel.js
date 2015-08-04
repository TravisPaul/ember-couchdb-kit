import Ember from "ember";

export default Ember.Component.extend({
    tagName: "span",

    click: function (event) {
        event.preventDefault();
        this.send("cancelIssueCreate");
    },
    actions: {
        cancelIssueCreate: function () {
            this.set("action", "setCreateIssue");
            this.sendAction("action", false);
        }
    }
});
