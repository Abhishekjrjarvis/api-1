const mongoose = require("mongoose")
const Department = require("./Department")
const Subject = require("./Subject")
const InstituteAdmin = require("./InstituteAdmin")
const Batch = require("./Batch")
const Staff = require("./Staff")
const Checklist = require("./Checklist")
const Fees = require("./Fees")
const Behaviour = require("./Behaviour")
const Attendence = require("./Attendence")
const Exam = require ("./Exam")

const classSchema = new mongoose.Schema({
    classCode: { type: String, required: true, unique: true },
    className: { type: String, required: true },
    classTitle: { type: String, required: true },
    classPhoto: { type :String, },
    classAbout: { type: String, },
    classStudentTotal: { type :String, },
    classSubjectTotal: { type: String, },
    classDisplayPerson: { type: String, },
    subject: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject"
        }
    ],
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin"
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch"
    },
    classTeacher: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    student: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        }
    ],
    ApproveStudent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student" 
        }
    ],
    checklist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Checklist"
        }
    ],
    fee: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fees"
        }
    ],
    studentBehaviour: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Behaviour"
        }
    ],
    classExam: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam"
        }
    ],
    attendence:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendence"
    }
})      

const Class = mongoose.model("Class", classSchema)

module.exports = Class