const mongoose = require('mongoose')
const Student = require('./Student')
const Class = require('./Class')
const Department = require('./Department')
const InstituteAdmin = require('./InstituteAdmin')

const complaintSchema = new mongoose.Schema({
    complaintType: {
        type: String,
        required: true
    },
    complaintContent: {
        type: String,
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    classes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    complaintStatus: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    complaintInsStatus: {
        type: String
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    }
})

const Complaint = mongoose.model('Complaint', complaintSchema)

module.exports = Complaint;