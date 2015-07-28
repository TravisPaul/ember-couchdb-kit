import Ember from "ember";

export default Ember.Component.extend({
    tagName: "span",

    click: function (event) {
        event.preventDefault();
        this.set("parentView.create", false);
    }
});
