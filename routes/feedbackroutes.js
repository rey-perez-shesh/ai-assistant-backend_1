const express = require("express");
const router = express.Router();

const {
    submitFeedback,
    getAllFeedback,
    getFeedbackByInquiry,
    deleteFeedback
} = require("../controllers/feedbackcontroller");

// CREATE feedback
router.post("/", submitFeedback);

// READ all feedback
router.get("/", getAllFeedback);

// READ feedback by inquiryId
router.get("/inquiry/:inquiryId", getFeedbackByInquiry);

// DELETE feedback
router.delete("/:id", deleteFeedback);

module.exports = router;