const mongoose = require('mongoose')
const InstituteAdmin = require('./InstituteAdmin')
const Staff = require('./Staff')

const leaveSchema = new mongoose.Schema({
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
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    leaveStatus: {
        type: String,
    }

})

const Leave = mongoose.model('Leave', leaveSchema)

module.exports = Leave