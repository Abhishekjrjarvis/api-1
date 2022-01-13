const mongoose = require('mongoose')
const Class = require('./Class')
const Department = require('./Department')
const Student = require('./Student')

const feeSchema = new mongoose.Schema({
    feeName: {
        type: String, 
        required: true
    },
    feeAmount: {
        type: String,
        required: true
    },
    feeDate: {
        type: String, 
        required: true
    },
    feeClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    feeDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    feeStudent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    studentsList: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Student'
        }
    ],
    feeStatus: {
        type: String,
        default: "Not Paid"
    }
})


const Fees = mongoose.model('Fees', feeSchema)


module.exports = Fees