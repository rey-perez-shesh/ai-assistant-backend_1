const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ---------------------------
// Middleware
// ---------------------------
app.use(cors())
app.use(express.json()) // parse JSON request bodies

// ---------------------------
// MongoDB Connection
// ---------------------------  
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log(" MongoDB Connected Successfully"))
  .catch((error) => console.error(" MongoDB Connection Error:", error));

// ---------------------------
// Import Routes
// ---------------------------
const loggingRoutes = require("./routes/loggingroutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const departmentsRoutes = require("./routes/departmentsRoutes");
const knowledgeBaseRoutes = require("./routes/knowledgeBaseRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

// ---------------------------
// API Base Paths
// ---------------------------
app.use("/api/logging", loggingRoutes);            // For login via email → LoggingHistory
app.use("/api/inquiries", inquiryRoutes);          // For submitting inquiries → InquiryHistory
app.use("/api/departments", departmentsRoutes);    // For CRUD departments → DepartmentsCollection
app.use("/api/knowledgebase", knowledgeBaseRoutes); // For retrieving/adding KB data → KnowledgeBase
app.use("/api/feedback", feedbackRoutes);          // For storing student feedback → FeedbackCollection

// ---------------------------
// Health Check Route
// ---------------------------
app.get("/", (req, res) => {
  res.send("AI Assistant Backend is Running...");
});
// Test endpoint — verify MongoDB connection and test insert/read
app.get("/api/test/db", async (req, res) => {
  try {
    const Departments = require("./models/departmentscollection");
    const count = await Departments.countDocuments();
    const sample = await Departments.findOne().lean();
    
    res.json({
      success: true,
      message: "MongoDB connection is working",
      totalDepartments: count,
      sampleDepartment: sample
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "MongoDB connection error",
      error: error.message
    });
  }
});

// ---------------------------
// Error Handling Middleware
// ---------------------------
app.use((err, req, res, next) => {
  console.error(" SERVER ERROR:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message
  });
});

// ---------------------------
// Start Server
// ---------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});