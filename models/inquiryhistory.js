const mongoose = require("mongoose");

const InquiryHistorySchema = new mongoose.Schema({
    email: { type: String, required: true },   // user identifier
    inquiryText: { type: String, required: true },
    cleanedText: { type: String },
    intent: { type: String },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "DepartmentsCollection" },
    aiResponse: { type: String },
    confidence: { type: Number },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("InquiryHistory", InquiryHistorySchema);