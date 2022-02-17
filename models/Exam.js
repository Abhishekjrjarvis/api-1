const mongoose = require('mongoose')
const Department = require('./Department')
const Subject = require('./Subject')
const InstituteAdmin = require('./InstituteAdmin')
const Batch = require('./Batch')
const Class = require('./Class')
const Staff = require('./Staff')
const Checklist = require('./Checklist')
const SubjectMaster = require('./SubjectMaster')

const examSchema = new mongoose.Schema({

    examName: { type: String, required: true },
    examType: { type: String, required: true },
    examMode: { type: String, required: true },
    examWeight: { type : Number },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    examForDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required:true  
    },
    examForClass: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true
        }
    ],
    subject:[
        {
            subMasterId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubjectMaster",
                required: true,
            },
            subjectName: {
                type: String,
                required: true
            },
            totalMarks: {
                type : Number,
                required: true
            },
            examDate: {
                type: Date,
            },
            examTime: {
                type: String,
            },
        },
    ],
})

    const Exam = mongoose.model('Exam', examSchema)

module.exports = Exam