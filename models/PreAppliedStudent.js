const mongoose = require("mongoose");
const Class = require("./Class");
const InstituteAdmin = require("./InstituteAdmin");
const Staff = require("./Staff");
const Fees = require("./Fees");
const Batch = require("./Batch");
const Student = require("./Student");
const Department = require("./Department");
const DepartmentApplication = require("./DepartmentApplication")
const User = require("./User");

const preAppliedStudentSchema = new mongoose.Schema(
{
    applicationForApply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DepartmentApplication"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    appliedForRound: { type: String },
    studentFirstName: { type: String },
    studentMiddleName: { type: String },
    studentLastName: { type: String},
    studentProfilePhoto: { type: String },
    photoId: { type: String },
    studentDOB: { type: Date },
    studentGender: { type: String },
    studentNationality: { type: String },
    studentMotherTongue: { type: String },
    studentCast: { type: String },
    studentCategory: { type: String },
    studentReligion: { type: String },
    studentBirthPlace: { type: String },
    studentDistrict: { type: String },
    studentState: { type: String },
    studentParents_GuardianName: { type: String },
    studentParents_GuardianContactNo: { type: String },
    studentAddress: { type: String },
    studentSelfContactNo: { type: Number, maxlength: 10, minlength: 10 },
    studentFilterField: { type: Number },
    // studentPreviousQualification: [
    //     {
    //         fieldName: { type: String },
    //         ObtainMarks: { type: Number },
    //         percentage: { Number },
    //         marksImagePath: { type: String },
    //     }
    //     ],
    studentAttachDocuments: [
        {
            labelText: { type: String },
            docFieldName: { type: String },
            docImagePath: { type: String },
        }
            ],
}
);

const PreAppliedStudent = mongoose.model("PreAppliedStudent", preAppliedStudentSchema);

module.exports = PreAppliedStudent;