const mongoose = require("mongoose");
const Class = require("./Class");
const InstituteAdmin = require("./InstituteAdmin");
const Staff = require("./Staff");
const Checklist = require("./Checklist");
const Fees = require("./Fees");
const Holiday = require("./Holiday");
const Batch = require("./Batch");
const SubjectMaster = require("./SubjectMaster");
const Student = require("./Student");
const Complaint = require("./Complaint");
const Field = require("./Field");

const departmentSchema = new mongoose.Schema({
  dName: { type: String, required: true },
  dTitle: { type: String, required: true },
  dEmail: { type: String },
  dPhoneNumber: { type: Number, minlength: 10 },
  dOperatingAdmin: { type: String },
  dStudentRepr: { type: String },
  dPhoto: { type: String },
  dVision: { type: String },
  dMission: { type: String },
  dAbout: { type: String },
  dStaffTotal: { type: Number },
  dStudentTotal: { type: Number },
  dAwards: { type: String },
  dSpeaker: { type: String },
  dStudentPresident: { type: String },
  dAdminClerk: { type: String },
  dVicePrinciple: { type: String },
  photoId: { type: String, default: "1" },
  photo: { type: String },
  coverId: { type: String, default: "2" },
  cover: { type: String },
  departmentClassMasters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassMaster",
    },
  ],
  departmentSubjectMasters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMaster",
    },
  ],

  departmentSelectBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  userBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  dHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  batches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  departmentExam: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  ],
  checklists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  fees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  departmentChatGroup: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  staffAttendence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StaffAttendence",
  },
  holiday: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Holiday",
    },
  ],
  class: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  ApproveStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  studentComplaint: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
  ],
  idCardField: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field",
    },
  ],
});

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
