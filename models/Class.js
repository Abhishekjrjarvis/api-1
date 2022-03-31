const mongoose = require("mongoose");
const Department = require("./Department");
const Subject = require("./Subject");
const InstituteAdmin = require("./InstituteAdmin");
const Batch = require("./Batch");
const Staff = require("./Staff");
const Checklist = require("./Checklist");
const Fees = require("./Fees");
const Behaviour = require("./Behaviour");
const Attendence = require("./Attendence");
const Exam = require("./Exam");
const ClassMaster = require("./ClassMaster");
const Complaint = require("./Complaint");
const StudentLeave = require("./StudentLeave");
const StudentTransfer = require("./StudentTransfer");
const Playlist = require("./Playlist");

const classSchema = new mongoose.Schema({
  classCode: { type: String, required: true, unique: true },
  className: { type: String, required: true },
  classTitle: { type: String, required: true },
  classPhoto: { type: String },
  classAbout: { type: String },
  classStudentTotal: { type: String },
  classSubjectTotal: { type: String },
  classDisplayPerson: { type: String },
  photoId: { type: String, default: "1" },
  photo: { type: String },
  coverId: { type: String, default: "2" },
  cover: { type: String },
  masterClassName: { type: mongoose.Schema.Types.ObjectId, ref: "ClassMaster" },
  classHeadTitle: { type: String, required: true },
  subject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  ApproveStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  checklist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  fee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  studentBehaviour: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Behaviour",
    },
  ],
  classExam: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  ],
  attendence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attendence",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  offlineTotalFee: {
    type: Number,
    default: 0,
  },
  onlineTotalFee: {
    type: Number,
  },
  classTotalCollected: {
    type: Number,
  },
  classTotalSubmitted: {
    type: Number,
  },
  receieveFee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  submitFee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  finalReportsSettings: {
    finalReport: { type: Boolean, default: false },
    attendence: { type: Boolean, default: false },
    behaviour: { type: Boolean, default: false },
    graceMarks: { type: Boolean, default: false },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  classStatus: {
    type: String,
    default: "UnLocked",
  },
  studentComplaint: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
  ],
  studentLeave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentLeave",
    },
  ],
  studentTransfer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentTransfer",
    },
  ],
  playlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
