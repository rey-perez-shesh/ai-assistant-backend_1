const express = require("express");
const router = express.Router();

const {
    createKBEntry,
    getKBEntries,
    getKBEntryById,
    updateKBEntry,
    deleteKBEntry
} = require("../controllers/knowledgeBasecontroller");

// CREATE KB entry
router.post("/", createKBEntry);

// READ all KB entries
router.get("/", getKBEntries);

// READ single KB entry
router.get("/:id", getKBEntryById);

// UPDATE KB entry
router.put("/:id", updateKBEntry);

// DELETE KB entry
router.delete("/:id", deleteKBEntry);

module.exports = router;