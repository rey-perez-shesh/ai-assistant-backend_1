const mongoose = require("mongoose");

const FeedbackCollectionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    inquiryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InquiryHistory",
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        default: ""
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("FeedbackCollection", FeedbackCollectionSchema);