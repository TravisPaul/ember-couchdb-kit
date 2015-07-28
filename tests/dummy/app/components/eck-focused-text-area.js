import Ember from "ember";

export default Ember.Component.extend({
    elementDidChange: function () {
        this.$().focus();
    }.observes("element")
});
