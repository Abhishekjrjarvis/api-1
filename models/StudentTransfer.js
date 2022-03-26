const mongoose = require('mongoose')
const Class = require('./Class')
const Student = require('./Student')

const studentTransferSchema = new mongoose.Schema({
    transferReason: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    fromClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    transferStatus: {
        type: String,
    }

})

const StudentTransfer = mongoose.model('StudentTransfer', studentTransferSchema)

module.exports = StudentTransfer