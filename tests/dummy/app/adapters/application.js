import DocumentAdapter from "ember-couch/adapters/document";

export default DocumentAdapter.extend({
    db: "boards",
    host: "http://localhost:5984"
});
