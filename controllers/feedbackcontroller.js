const Feedback = require("../models/feedbackcollection");
const InquiryHistory = require("../models/inquiryhistory");

// CREATE feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { email, inquiryId, rating, comment } = req.body;

        if (!email || !inquiryId || !rating) {
            return res.status(400).json({
                success: false,
                message: "Email, inquiryId, and rating are required."
            });
        }

        // Ensure the inquiry exists
        const inquiry = await InquiryHistory.findById(inquiryId);
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found."
            });
        }

        const newFeedback = await Feedback.create({
            email,
            inquiryId,
            rating,
            comment
        });

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully.",
            data: newFeedback
        });

    } catch (error) {
        console.error("Error submitting feedback:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while submitting feedback."
        });
    }
};

// GET all feedback
exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().populate("inquiryId");

        return res.status(200).json({
            success: true,
            data: feedback
        });

    } catch (error) {
        console.error("Error retrieving feedback:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving feedback."
        });
    }
};

// GET feedback for a specific inquiry
exports.getFeedbackByInquiry = async (req, res) => {
    try {
        const { inquiryId } = req.params;

        const feedback = await Feedback.find({ inquiryId }).populate("inquiryId");

        return res.status(200).json({
            success: true,
            data: feedback
        });

    } catch (error) {
        console.error("Error retrieving feedback:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving feedback."
        });
    }
};

// DELETE feedback
exports.deleteFeedback = async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Feedback deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting feedback:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting feedback."
        });
    }
};
