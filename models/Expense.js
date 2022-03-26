const mongoose = require('mongoose')
const Finance = require('./Finance')

const expenseSchema = new mongoose.Schema({
    expenseAccount: {
        type: String,
        required: true
    },
    expensePurpose: {
        type: String,
        required: true
    },
    expenseAmount: {
        type: Number,
        required: true
    },
    expensePaid: {
        type: String,
        required: true
    },
    expenseDesc: {
        type: String,
        required: true
    },
    expenseAck: {
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

const Expense = mongoose.model('Expense', expenseSchema)

module.exports = Expense