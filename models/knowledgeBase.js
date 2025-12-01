const mongoose = require("mongoose");

const KnowledgeBaseSchema = new mongoose.Schema({
    intent: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DepartmentsCollection"
    }
});

module.exports = mongoose.model("KnowledgeBase", KnowledgeBaseSchema);