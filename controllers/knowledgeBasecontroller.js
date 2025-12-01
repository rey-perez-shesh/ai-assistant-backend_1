const KnowledgeBase = require("../models/knowledgeBase");

// CREATE KB entry
exports.createKBEntry = async (req, res) => {
    try {
        const { intent, question, answer, departmentId } = req.body;

        const newEntry = await KnowledgeBase.create({
            intent,
            question,
            answer,
            departmentId
        });

        return res.status(201).json({
            success: true,
            message: "Knowledge Base entry created successfully.",
            data: newEntry
        });

    } catch (error) {
        console.error("Error creating KB entry:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while creating KB entry."
        });
    }
};

// GET all KB entries
exports.getKBEntries = async (req, res) => {
    try {
        const entries = await KnowledgeBase.find().populate("departmentId");

        return res.status(200).json({
            success: true,
            data: entries
        });

    } catch (error) {
        console.error("Error fetching KB entries:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving KB entries."
        });
    }
};

// GET single KB entry
exports.getKBEntryById = async (req, res) => {
    try {
        const entry = await KnowledgeBase.findById(req.params.id).populate("departmentId");

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Knowledge Base entry not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: entry
        });

    } catch (error) {
        console.error("Error retrieving KB entry:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving KB entry."
        });
    }
};

// UPDATE KB entry
exports.updateKBEntry = async (req, res) => {
    try {
        const { intent, question, answer, departmentId } = req.body;

        const updatedEntry = await KnowledgeBase.findByIdAndUpdate(
            req.params.id,
            { intent, question, answer, departmentId },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Knowledge Base entry updated successfully.",
            data: updatedEntry
        });

    } catch (error) {
        console.error("Error updating KB entry:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating KB entry."
        });
    }
};

// DELETE KB entry
exports.deleteKBEntry = async (req, res) => {
    try {
        await KnowledgeBase.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Knowledge Base entry deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting KB entry:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting KB entry."
        });
    }
};