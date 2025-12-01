const express = require("express");
const router = express.Router();
const { processInquiry } = require("../controllers/inquirycontroller");

router.post("/", processInquiry);

module.exports = router;