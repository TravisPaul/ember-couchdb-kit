import DS from "ember-data";

export default DS.Model.extend({
    issues: DS.hasMany("issue", {
        async: false
    }),
    type: DS.attr("string", {
        defaultValue: "position"
    })
});
