import DS from "ember-data";

export default DS.Model.extend({
    issues: DS.hasMany("issue", {
        async: true
    }),
    type: DS.attr("string", {
        defaultValue: "position"
    }),
    rev: DS.attr("string")
});
