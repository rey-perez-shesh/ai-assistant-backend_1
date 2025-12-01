const mongoose = require("mongoose");

const DepartmentsCollectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    intentsHandled: {
        type: [String], // list of intents mapped to this department
        default: []
    }
});

module.exports = mongoose.model("DepartmentsCollection", DepartmentsCollectionSchema);