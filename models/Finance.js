const mongoose = require('mongoose')
const Staff = require('./Staff')
const InstituteAdmin = require('./InstituteAdmin')
const Income = require('./Income')
const Expense = require('./Expense')
const Class = require('./Class')

const financeSchema = new mongoose.Schema({
    financeHead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    financeName: { type: String },
    financePhoneNumber: { type: Number },
    financeEmail: { type: String },
    financeAbout: { type: String },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    },
    incomeDepartment: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Income'
        }
    ],
    expenseDepartment: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Expense'
        }
    ],
    classRoom: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        }
    ]
})


const Finance = mongoose.model('Finance', financeSchema)


module.exports = Finance