const mongoose = require('mongoose')
const Student = require('./Student')
const Class = require('./Class')
const Attendence = require('./Attendence')

const attendenceDateSchema = new mongoose.Schema({
    attendDate: {
        type: Date,
        required: true
    },
    attendTime: {
        type: String,
        required: true
    },
    outTime: {
        type: String,
    },
    presentstudents:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    absentstudents:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    attendence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attendence'
    },
    className: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    presentStudent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    absentStudent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
})

const AttendenceDate = mongoose.model('AttendenceDate', attendenceDateSchema)

module.exports = AttendenceDate