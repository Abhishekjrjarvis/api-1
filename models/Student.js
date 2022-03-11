const mongoose = require("mongoose");
const InstituteAdmin = require("./InstituteAdmin");
const User = require("./User");
const Department = require("./Department");
const Subject = require("./Subject");
const Fees = require("./Fees");
const AttendenceDate = require("./AttendenceDate");
const Attendence = require("./Attendence");
const Exam = require("./Exam");
const Behaviour = require("./Behaviour");

const studentSchema = new mongoose.Schema({
  studentCode: { type: String },
  studentProfilePhoto: { type: String },
  photoId: { type: String },
  studentFirstName: { type: String },
  studentMiddleName: { type: String },
  studentLastName: { type: String },
  studentDOB: { type: String },
  studentGender: { type: String },
  studentNationality: { type: String },
  studentMTongue: { type: String },
  studentCast: { type: String },
  studentCastCategory: { type: String },
  studentReligion: { type: String },
  studentBirthPlace: { type: String },
  studentBookNo: { type: String },
  studentDistrict: { type: String },
  studentState: { type: String },
  studentAddress: { type: String },
  studentPhoneNumber: { type: Number, maxlength: 10, minlength: 10 },
  studentAadharNumber: { type: String, maxlength: 12, minlength: 12 },
  studentParentsName: { type: String },
  studentParentsPhoneNumber: { type: Number, maxlength: 10, minlength: 10 },
  studentDocuments: { type: String },
  studentAadharCard: { type: String },
  studentCertificateNo: { type: String },
  studentStatus: { type: String, default: "Not Approved" },
  studentBehaviourReportStatus: { type: String, default: "Not Ready" },
  studentPremoteStatus: { type: String, default: "Not Promoted" },
  studentReason: { type: String },
  studentCertificateDate: { type: String },
  studentLeavingInsDate: { type: String },
  studentLeavingRemark: { type: String },
  studentLeavingBehaviour: { type: String },
  studentLeavingStudy: { type: String },
  studentLeavingReason: { type: String },
  studentBookNo: { type: String },
  studentROLLNO: { type: String },
  studentBehaviourStatus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Behaviour",
  },
  studentGRNO: { type: String },
  studentClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  studentFinalReportFinalizedStatus: { type: String, default: "Not Ready" },
  studentFinalReportData: {
    finalObtainTotal: { type: String },

    finalMarksTotalTotal: {
      type: Number,
    },
    OtherMarksObtainTotal: {
      type: Number,
    },
    OtherMarksTotalTotal: {
      type: Number,
    },
    FinalObtainMarksTotal: {
      type: Number,
    },
    FinalTotalMarksTotal: {
      type: Number,
    },
    SubjectWiseMarks: [
      {
        subName: { type: String },
        finalExamObtain: { type: Number },
        finalExamTotal: { type: Number },
        otherExamObtain: { type: Number },
        otherExamTotal: { type: Number },
        finalObtainTotal: { type: Number },
        finalTotalTotal: { type: Number },
      },
    ],
  },
  studentMarks: [
    {
      examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
      },
      allSubjectMarksStatus: {
        type: String,
        default: "Not Updated",
      },
      examWeight: {
        type: Number,
      },
      subjectMarks: [
        {
          subMasterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubjectMaster",
          },
          subjectName: {
            type: String,
          },
          obtainMarks: {
            type: Number,
          },
          subjectMarksStatus: {
            type: String,
            default: "Not Updated",
          },
        },
      ],
    },
  ],
  studentFee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  attendDate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendenceDate",
    },
  ],
  attendenceReg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attendence",
  },
  checklist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  checklistAllottedStatus: {
    type: String,
    default: "Not Allotted",
  },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
