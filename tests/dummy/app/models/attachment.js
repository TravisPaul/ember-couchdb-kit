import DS from "ember-data";

export default DS.Model.extend({
    content_type: DS.attr("string"),
    length: DS.attr("number"),
    file_name: DS.attr("string"),
    db: DS.attr("string", {
        defaultValue: "boards"
    })
});
