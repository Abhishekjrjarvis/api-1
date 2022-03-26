const mongoose = require('mongoose')
const Class = require('./Class')
const Student = require('./Student')

const studentLeaveSchema = new mongoose.Schema({
    leaveReason: {
        type: String,
        required: true
    },
    leaveDateFrom: {
        type: String,
        required: true
    },
    leaveDateTo: {
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
    leaveStatus: {
        type: String,
    }

})

const StudentLeave = mongoose.model('StudentLeave', studentLeaveSchema)

module.exports = StudentLeave