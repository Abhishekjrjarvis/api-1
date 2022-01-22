const mongoose = require('mongoose')
const Class = require('./Class')
const Department = require('./Department')
const Student = require('./Student')

const checklistSchema = new mongoose.Schema({
    checklistName: {
        type: String,
        required: true
    },
    checklistFees: {
        type: String,
        required: true
    },
    checklistAmount: {
        type: String,
        required: true
    },
    checklistClass:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    checklistDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    student: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    studentAssignedStatus: {
        type: String,
        default: 'Not Assigned'
    }
})

const Checklist = mongoose.model('Checklist', checklistSchema)

module.exports = Checklist