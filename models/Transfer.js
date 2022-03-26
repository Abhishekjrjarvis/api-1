const mongoose = require('mongoose')
const InstituteAdmin = require('./InstituteAdmin')
const Staff = require('./Staff')

const transferSchema = new mongoose.Schema({
    transferReason: {
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
    transferStatus: {
        type: String,
    }

})

const Transfer = mongoose.model('Transfer', transferSchema)

module.exports = Transfer