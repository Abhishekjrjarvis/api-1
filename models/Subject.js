const mongoose = require("mongoose");
const Department = require("./Department");
const Class = require("./Class");
const InstituteAdmin = require("./InstituteAdmin");
const Staff = require("./Staff");
const SubjectMaster = require("./SubjectMaster");
const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
  },
  subjectTitle: {
    type: String,
    required: true,
  },
  subjectTeacherName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  subjectMasterName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMaster",
  },
  subjectExams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  ],
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
});

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
