const InquiryHistory = require("../models/inquiryhistory");
const Departments = require("../models/departmentscollection");
const KnowledgeBase = require("../models/knowledgeBase");

// Placeholder TensorFlow NLP function
const predictIntent = require("../nlp/predictIntent");

exports.processInquiry = async (req, res) => {
    try {
        const { email, inquiryText } = req.body;

        if (!email || !inquiryText) {
            return res.status(400).json({
                success: false,
                message: "Email and inquiry text are required."
            });
        }

        // STEP 1 – Clean text
        const cleaned = inquiryText.toLowerCase().trim();

        // STEP 2 – Initial DB save
        const inquiryRecord = await InquiryHistory.create({
            email,
            inquiryText,
            cleanedText: cleaned
        });

        // STEP 3 – TensorFlow NLP intent prediction
        const prediction = await predictIntent(cleaned);
        const predictedIntent = prediction.intent;
        const confidence = prediction.confidence;

        // STEP 4 – Find mapped department
        const department = await Departments.findOne({
            intentsHandled: predictedIntent
        });

        // STEP 5 – Retrieve matching KB answer
        const kbEntry = await KnowledgeBase.findOne({ intent: predictedIntent });

        const aiResponse = kbEntry ? kbEntry.answer : "I'm sorry, I don't have information on that yet.";

        // STEP 6 – Update inquiry with AI output
        inquiryRecord.intent = predictedIntent;
        inquiryRecord.confidence = confidence;
        inquiryRecord.departmentId = department ? department._id : null;
        inquiryRecord.aiResponse = aiResponse;

        await inquiryRecord.save();

        // STEP 7 – Send back to Flutter
        return res.status(200).json({
            success: true,
            message: "AI response generated successfully.",
            data: {
                intent: predictedIntent,
                confidence,
                department: department ? department.name : "Unmapped",
                aiResponse
            }
        });

    } catch (error) {
        console.error("Error processing inquiry:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while processing inquiry."
        });
    }
};