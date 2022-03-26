const mongoose = require("mongoose");
const InstituteAdmin = require("./InstituteAdmin");
const User = require("./User");
const Department = require("./Department");
const Subject = require("./Subject");
const Batch = require("./Batch");
const StaffAttendenceDate = require("./StaffAttendenceDate");
const StaffAttendence = require("./StaffAttendence");
const Finance = require('./Finance')
const Sport = require('./Sport')
const SportClass = require('./SportClass')
const Leave = require('./Leave')
const Transfer = require('./Transfer')
const GroupConversation = require('./GroupConversation')
const ELearning = require("./ELearning");
const Library = require("./Library");
const AdmissionAdmin = require('./AdmissionAdmin')


const staffSchema = new mongoose.Schema({
  staffCode: { type: String },
  staffProfilePhoto: { type: String },
  photoId: { type: String },
  staffFirstName: { type: String },
  staffMiddleName: { type: String },
  staffLastName: { type: String },
  staffDOB: { type: String },
  staffGender: { type: String },
  staffNationality: { type: String },
  staffMTongue: { type: String },
  staffCast: { type: String },
  staffCastCategory: { type: String },
  staffReligion: { type: String },
  staffBirthPlace: { type: String },
  staffDistrict: { type: String },
  staffState: { type: String },
  staffAddress: { type: String },
  staffPhoneNumber: { type: Number, maxlength: 10, minlength: 10 },
  staffAadharNumber: { type: String, maxlength: 12, minlength: 12 },
  staffQualification: { type: String },
  staffDocuments: { type: String },
  staffAadharCard: { type: String },
  staffStatus: { type: String, default: "Not Approved" },
  staffROLLNO: { type: String },
  staffDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  staffClass: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  staffSubject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  batches: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  attendDates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffAttendenceDate",
    },
  ],
  attendenceRegs: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StaffAttendence",
  },
  financeDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Finance'
    }
  ],
  sportDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport'
    }
  ],
  staffSportClass: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SportClass'
    }
  ],
  staffLeave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Leave'
    }
  ],
  staffTransfer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transfer'
    }
  ],
  joinedInsGroup: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupConversation'
    }
  ],
  elearning: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ELearning",
    },
  ],
  library: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
    },
  ],
  staffAdmissionAdmin: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdmissionAdmin"
  }],
});

const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;
