const mongoose = require('mongoose')
const InstituteAdmin = require('./InstituteAdmin')
const User = require('./User')
const Department = require('./Department')
const Subject = require('./Subject')
const Fees = require('./Fees')
const AttendenceDate = require('./AttendenceDate')
const Attendence = require('./Attendence')

const studentSchema = new mongoose.Schema({
    studentCode: { type: String },
    studentProfilePhoto: { type: String },
    studentFirstName: { type: String },
    studentMiddleName: { type: String },
    studentLastName: { type: String },
    studentDOB: { type: String },
    studentGender: { type: String },
    studentNationality: { type:  String }, 
    studentMTongue: { type: String },
    studentCast: { type: String }, 
    studentCastCategory: { type: String },
    studentReligion: { type: String }, 
    studentBirthPlace: { type: String }, 
    studentDistrict: { type: String },
    studentState: { type: String },
    studentAddress: { type: String },
    studentPhoneNumber: { type: Number, maxlength: 10, minlength: 10 },
    studentAadharNumber: { type: String, maxlength: 12, minlength: 12 },
    studentParentsName: { type: String }, 
    studentParentsPhoneNumber: { type: Number, maxlength: 10, minlength: 10 },
    studentDocuments: { type: String }, 
    studentAadharCard: { type: String },
    studentStatus: { type: String, default: "Not Approved" },
    studentBehaviourReportStatus: { type: String, default: "Not Ready"},
    studentGRNO: { type: String },
    studentClass:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'InstituteAdmin'
    },
    studentFee: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Fees'
        }
    ],
    attendDate: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AttendenceDate'
        }
    ],
    attendenceReg: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attendence'
    }

})

const Student = mongoose.model('Student', studentSchema)

module.exports = Student