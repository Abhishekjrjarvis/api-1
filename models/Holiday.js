const mongoose = require('mongoose')
const Department = require('./Department')

const holidaySchema = new mongoose.Schema({
    dDate: {
        type: Date,
        required: true
    },
    dHolidayReason: {
        type: String, 
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }
})

const Holiday = mongoose.model('Holiday', holidaySchema)

module.exports = Holiday