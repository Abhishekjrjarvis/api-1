const mongoose = require('mongoose')
const Finance = require('./Finance')

const incomeSchema = new mongoose.Schema({
    incomeAccount: {
        type: String,
        required: true
    },
    incomePurpose: {
        type: String,
        required: true
    },
    incomeAmount: {
        type: Number,
        required: true
    },
    incomeFrom: {
        type: String,
        required: true
    },
    incomeDesc: {
        type: String,
        required: true
    },
    incomeAck: {
        type: String
    },
    finances: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Finance'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Income = mongoose.model('Income', incomeSchema)

module.exports = Income