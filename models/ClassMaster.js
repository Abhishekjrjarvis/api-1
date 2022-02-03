const mongoose = require("mongoose");
const Department = require("./Department");

const InstituteAdmin = require("./InstituteAdmin");

const classMasterSchema = new mongoose.Schema({
  className: { type: String, required: true },
  classTitle: { type: String, required: true },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },

  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  classDivision: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
});

const ClassMaster = mongoose.model("ClassMaster", classMasterSchema);

module.exports = ClassMaster;
