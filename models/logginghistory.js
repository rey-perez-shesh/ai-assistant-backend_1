const mongoose = require('mongoose');

const LoggingHistorySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    loginTimestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LoggingHistory', LoggingHistorySchema);