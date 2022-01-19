const mongoose = require('mongoose')
const Department = require('./Department')
const Subject = require('./Subject')
const InstituteAdmin = require('./InstituteAdmin')
const Batch = require('./Batch')
const Class = require('./Class')
const Staff = require('./Staff')
const Checklist = require('./Checklist')

const examSchema = new mongoose.Schema({
    
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    examName: { type: String, required: true },
    examType: { type: Number, required: true },
    examDate: { type: Date, required: true },
    examWeight: {type : Number, required: true },
    examForClass: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Class' 
        },
    subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
})      

const Exam = mongoose.model('Exam', examSchema)

module.exports = Exam