const mongoose = require("mongoose");
const Class = require("./Class");
const InstituteAdmin = require("./InstituteAdmin");
const Staff = require("./Staff");
const Fees = require("./Fees");
const Batch = require("./Batch");
const Student = require("./Student");
const Department = require("./Department");
const PreAppliedStudent = require("./PreAppliedStudent")
 
 
 
const departmentApplicationSchema = new mongoose.Schema({
 
   applicationTitle: { type: String },
   availableSeats: { type: Number },
   managementSeats: { type: Number },
   admissionProcessDetails: [ {type: String} ],
   applicationForDepartment: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Department"
   },
   batch: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Batch"  
   },
   applicationFee: { type: Number },
   admissionFee: { type: Number },

   rounds: [
       {
           roundName: { type: String },
           
           applicationStartDate: { type: Date },
           applicationLastDate: { type: Date  },
           candidateSelectionLastDate: { type: Date },
           admissionLastDate: { type: Date }
       },
   ],
   formDetails: {
       studentProfilePhoto: { type: Boolean },
       studentFirstName: { type: Boolean },
       studentMiddleName: { type: Boolean },
       studentLastName: { type: Boolean},
       studentDOB: { type: Boolean },
       studentGender: { type: Boolean },
       studentNationality: { type: Boolean },
       studentMotherTongue: { type: Boolean },
       studentCast: { type: Boolean },
       studentCategory: { type: Boolean },
       studentReligion: { type: Boolean },
       studentBirthPlace: { type: Boolean },
       studentDistrict: { type: Boolean },
       studentState: { type: Boolean },
       studentParents_GuardianName: { type: Boolean },
       studentParents_GuardianContactNo: { type: Boolean },
       studentAddress: { type: Boolean },
       studentSelfContactNo: { type: Boolean },
       studentFilterFieldName: { type : String },
       studentFilterField: { type: Boolean },
       studentAttachDocuments: [
                               {
                                   fieldLabel: String,
                                   fileUploadField: Boolean,
                                   fieldUploadPlaceHolder: String,
                                   inputBox2: Boolean,
                                   inputBox2PlaceHolder: String
                               }
       ],
           },
   autoUpdateProcess:{
       selectionStatus: { type: String, default: "Not Updated" },
       selectedStatus: { type: String, default: "Not Updated" },
       classAllotment: { type: String, default: "Not Updated" },
   },
   studentData: [
       {
           studentStatus: { type: String, default: "Applied" },
           studentSelectedRound: { type: String, },
           applicationFeeStatus: { type: String, default: "Not Payed"},
           admissionFeeStatus: { type: String, default: "Not Payed"},
           studentDetails: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "PreAppliedStudent"
           },
       }
   ]
});
 
const DepartmentApplication = mongoose.model("DepartmentApplication", departmentApplicationSchema);
 
module.exports = DepartmentApplication;