const mongoose = require('mongoose')
const InstituteAdmin = require('./InstituteAdmin')
const Department = require('./Department')
const Batch = require('./Batch')


const fieldSchema = new mongoose.Schema({
    fieldName:{
        type: String,
        required: true
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    batches: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    }
})


const Field = mongoose.model('Field', fieldSchema)

module.exports = Field