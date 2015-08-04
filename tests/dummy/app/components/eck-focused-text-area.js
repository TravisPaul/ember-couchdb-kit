import Ember from "ember";

export default Ember.Component.extend({
    tagName: "textarea",
    didInsertElement: function () {
        this.$().focus();
    }
});
