const mongoose = require("mongoose");
const Department = require("./Department");
const Class = require("./Class");
const Staff = require("./Staff");
const SubjectMaster = require("./SubjectMaster");
const batchSchema = new mongoose.Schema({
  batchName: {
    type: String,
    required: true,
  },
  batchStatus: {
    type: String,
    default: "UnLocked"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  subjectMasters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMaster",
    },
  ],
  classroom: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  batchExam: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam"
    }
  ],
  batchStaff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
});

const Batch = mongoose.model("Batch", batchSchema);

module.exports = Batch;
