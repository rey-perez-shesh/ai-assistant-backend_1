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

        //  – TensorFlow NLP intent prediction (use exported function)
        const prediction = await predictAIResponse(cleaned);
        const predictedIntent = prediction.intent;
        const confidence = prediction.confidence;
        const departmentName = prediction.department;
        const answer = prediction.answer;
        const kbId = prediction.kbId || null;

        //  – Find mapped department by name
        const department = departmentName
            ? await Departments.findOne({ name: new RegExp(`^${departmentName}$`, 'i') })
            : null;

        // Update the initial inquiry record with prediction results
        const updatedInquiry = await InquiryHistory.findByIdAndUpdate(
            inquiryRecord._id,
            {
                intent: predictedIntent,
                departmentId: department ? department._id : null,
                aiResponse: answer,
                confidence: confidence
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "AI response generated successfully.",
            data: {
                intent: predictedIntent,
                confidence,
                department: department ? department.name : (departmentName || "Unmapped"),
                aiResponse: answer,
                kbReference: kbId,
                inquiry: updatedInquiry
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