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
        type: Number,
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
    },
    studentsList: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Student'
        }
    ],
    checklistFeeStatus: {
        type: String,
        default: "Not Paid"
    },
    checklistStudent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }
})

const Checklist = mongoose.model('Checklist', checklistSchema)

module.exports = Checklist