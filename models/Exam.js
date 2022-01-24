const mongoose = require('mongoose')
const Department = require('./Department')
const Subject = require('./Subject')
const InstituteAdmin = require('./InstituteAdmin')
const Batch = require('./Batch')
const Class = require('./Class')
const Staff = require('./Staff')
const Checklist = require('./Checklist')

const examSchema = new mongoose.Schema({
    
    examType: { type: String, required: true },
    examName: { type: String, required: true },
    examMode: { type: String, required: true },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin',
        require: true
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        require: true
    },
    examForDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        
    },
    examForClass: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Class',
            require: true
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        subTeacher: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        examDate: { type: Date, required: true },
        examTime: { type: String, required: true },
        examWeight: {type : Number, required: true },
        totalMarks: {type : Number, required: true },
    })      
    
    const Exam = mongoose.model('Exam', examSchema)
    
module.exports = Exam