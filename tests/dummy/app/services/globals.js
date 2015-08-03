import Ember from "ember";

export default Ember.Service.extend({
    host: "http://localhost:5984",
    boards: ["common", "intermediate", "advanced"]
});
