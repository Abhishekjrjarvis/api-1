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
const SportClass = require("./SportClass");
const SportTeam = require("./SportTeam");
const SportEventMatch = require("./SportEventMatch");
const SportEvent = require("./SportEvent");
const Complaint = require("./Complaint");
const Batch = require("./Batch");
const StudentLeave = require("./StudentLeave");
const StudentTransfer = require("./StudentTransfer");
const Library = require("./Library");
const Collect = require("./Collect");
const Issue = require("./Issue");
const Payment = require("./Payment");
const ApplyPayment = require("./ApplyPayment");

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
  studentMothersName: { type: String },
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
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  onlineFeeList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  onlineCheckList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  offlineFeeList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  offlineCheckList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  sportEvent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportEvent",
    },
  ],
  sportClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SportClass",
  },
  sportTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SportTeam",
  },
  sportEventMatch: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportEventMatch",
    },
  ],
  rankTitle: {
    type: String,
  },
  extraPoints: {
    type: Number,
    default: 0,
  },
  complaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
  ],
  batches: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  studentChecklist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  leave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentLeave",
    },
  ],
  transfer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentTransfer",
    },
  ],
  paymentList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  ],
  applyList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApplyPayment",
    },
  ],
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  borrow: [{ type: mongoose.Schema.Types.ObjectId, ref: "Issue" }],
  deposite: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collect" }],
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
