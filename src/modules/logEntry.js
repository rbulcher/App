const mongoose = require('mongoose')

const { Schema } = mongoose;

const requiredString = {
    type: String,
    required: true,
}

const logEntrySchema = new Schema({
    title: requiredString,
    description: String,
    comments: String,
    deliverDate: String,
    address: String,
},
{
    timestamps: true
});

const LogEntry = mongoose.model('LogEntry', logEntrySchema)

module.exports = LogEntry;