const InquiryHistory = require("../models/inquiryhistory");
const Departments = require("../models/departmentscollection");
const KnowledgeBase = require("../models/knowledgeBase");

const { predictAIResponse } = require("../nlp/keywordIntentEngine");

exports.processInquiry = async (req, res) => {
    try {
        const { email, inquiryText } = req.body;

        if (!email || !inquiryText) {
            return res.status(400).json({
                success: false,
                message: "Email and inquiry text are required."
            });
        }

        //  – Clean text
        const cleaned = inquiryText.toLowerCase().trim();

        //  – Initial DB save
        const inquiryRecord = await InquiryHistory.create({
            email,
            inquiryText,
            cleanedText: cleaned
        });

        //  – TensorFlow NLP intent prediction
        const prediction = await predictIntent(cleaned);
        const predictedIntent = prediction.intent;
        const confidence = prediction.confidence;
        const departmentName = prediction.department;

        //  – Find mapped department
        const department = await Departments.findOne({
            intentsHandled: predictedIntent
        });
 const savedInquiry = await InquiryHistory.create({
            email,
            inquiryText: cleaned,
            predictedIntent: intent,
            department: dept ? dept._id : null,
            response: answer,
            confidenceScore: confidence,
            kbReference: kbId,
            createdAt: new Date()
        });


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