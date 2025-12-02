const mongoose = require("mongoose");

const DepartmentsCollectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    keywords: {      // 🔥 NEW: This is your “intent predictor”
        type: [String],
        default: []
    
    }
});

module.exports = mongoose.model("DepartmentsCollection", DepartmentsCollectionSchema);