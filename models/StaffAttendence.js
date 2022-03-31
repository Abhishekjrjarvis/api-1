const mongoose = require('mongoose')
const Staff = require('./Staff')
const Department = require('./Department')
const StaffAttendenceDate = require('./StaffAttendenceDate')

const staffAttendenceSchema = new mongoose.Schema({
    staffAttendenceDate: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StaffAttendenceDate'
        }
    ],
    department: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Department'
    }
})

const StaffAttendence = mongoose.model('StaffAttendence', staffAttendenceSchema)

module.exports = StaffAttendence