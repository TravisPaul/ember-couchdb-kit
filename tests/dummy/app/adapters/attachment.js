/* global App */
import AttachmentAdapter from "ember-couch/adapters/attachment";

export default AttachmentAdapter.extend({
    db: "boards",
    host: "http://localhost:5984"
});
