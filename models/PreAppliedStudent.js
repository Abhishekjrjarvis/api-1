const mongoose = require("mongoose");
const Class = require("./Class");
const InstituteAdmin = require("./InstituteAdmin");
const Staff = require("./Staff");
const Fees = require("./Fees");
const Batch = require("./Batch");
const Student = require("./Student");
const Department = require("./Department");
const DepartmentApplication = require("./DepartmentApplication");
const User = require("./User");

const preAppliedStudentSchema = new mongoose.Schema({
  applicationForApply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DepartmentApplication",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  appliedForRound: { type: String },

  studentProfilePhoto: { type: String },
  photoId: { type: String },

  studentFirstName: { type: String },
  studentMiddleName: { type: String },
  studentLastName: { type: String },
  studentDOB: { type: Date },
  studentGender: { type: String },
  studentNationality: { type: String },
  studentMTongue: { type: String },
  studentCast: { type: String },
  studentCastCategory: { type: String },
  studentReligion: { type: String },
  studentBirthPlace: { type: String },
  studentDistrict: { type: String },
  studentState: { type: String },
  studentParentsName: { type: String },
  studentParentsPhoneNumber: { type: Number, maxlength: 10, minlength: 10 },
  studentAddress: { type: String },
  studentPhoneNumber: { type: Number, maxlength: 10, minlength: 10 },
  studentParents_Name: { type: String },
  studentParents_ContactNo: { type: String },
  studentPName: { type: String },
  studentFilterField: { type: Number },
  studentAttachDocuments: [
    {
      labelText: { type: String },
      docFieldName: { type: String },
      docImagePath: { type: String },
    },
  ],
});

const PreAppliedStudent = mongoose.model(
  "PreAppliedStudent",
  preAppliedStudentSchema
);

module.exports = PreAppliedStudent;
