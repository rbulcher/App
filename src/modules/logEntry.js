const mongoose = require('mongoose')

const { Schema } = mongoose;

const logEntrySchema = new Schema({
    address: {type: String, required: true},
    deliverDateAndType: {type: String, required: true},
    description: String,
    location: {
        longitude: { type: Number, required: true },
         latitude: { type: Number, required: true },
    },
},
{
    timestamps: true
});

const LogEntry = mongoose.model('LogEntry', logEntrySchema)

module.exports = LogEntry;