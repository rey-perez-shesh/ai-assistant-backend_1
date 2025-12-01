// controllers/loggingController.js

const LoggingHistory = require('../models/logginghistory');

// POST: /api/login
// This function logs the user's email every time they open/use the system
exports.logUserLogin = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        // Create a new log entry
        const logEntry = await LoggingHistory.create({
            email: email,
            loginTimestamp: new Date()
        });

        return res.status(201).json({
            success: true,
            message: "Login recorded successfully.",
            data: logEntry
        });

    } catch (error) {
        console.error("Error saving login history:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while saving login history."
        });
    }
};