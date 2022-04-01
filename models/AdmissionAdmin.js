const mongoose = require("mongoose");
const Class = require("./Class");
const InstituteAdmin = require("./InstituteAdmin");
const Staff = require("./Staff");
const Fees = require("./Fees");
const Batch = require("./Batch");
const Student = require("./Student");
const Department = require("./Department");
const DepartmentApplication = require("./DepartmentApplication");

const admissionAdminSchema = new mongoose.Schema({
  institute: { type: mongoose.Schema.Types.ObjectId, ref: "InstituteAdmin" },
  adAdminName: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  contactNumber: { type: Number },
  emailId: { type: String },
  admissionProcess: { type: String },
  photoId: { type: String, default: "1" },
  photo: { type: String },
  coverId: { type: String, default: "2" },
  cover: { type: String },
  about: { type: String },
  feeCollection: [
    {
      financialYear: { type: String },
      monthName: { type: String },
      totalAmount: { type: Number },
      applicationFeeTotal: { type: Number },
      admissionFeeTotal: { type: Number },
      totalAdmissionApprove: { type: Number, default: 0 },
    },
  ],
  departmentApplications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DepartmentApplication",
    },
  ],
});

const AdmissionAdmin = mongoose.model("AdmissionAdmin", admissionAdminSchema);

module.exports = AdmissionAdmin;
