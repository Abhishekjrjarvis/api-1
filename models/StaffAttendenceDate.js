const mongoose = require('mongoose')
const Staff = require('./Staff')
const Department = require('./Department')
const StaffAttendence = require('./StaffAttendence')

const staffAttendenceDateSchema = new mongoose.Schema({
    staffAttendDate: {
        type: Date,
        required: true
    },
    staffAttendTime: {
        type: String,
        required: true
    },
    outTime: {
        type: String,
    },
    presentstaffs:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    absentstaffs:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    staffAttendence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StaffAttendence'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    presentStaff: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        }
    ],
    absentStaff: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        }
    ],
})

const StaffAttendenceDate = mongoose.model('StaffAttendenceDate', staffAttendenceDateSchema)

module.exports = StaffAttendenceDate