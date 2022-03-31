const mongoose = require('mongoose')
const Student = require('./Student')
const Class = require('./Class')
const AttendenceDate = require('./AttendenceDate')

const attendenceSchema = new mongoose.Schema({
    attendenceDate: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AttendenceDate'
        }
    ],
    className: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Class'
    }
})

const Attendence = mongoose.model('Attendence', attendenceSchema)

module.exports = Attendence