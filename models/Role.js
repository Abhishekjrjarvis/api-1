const mongoose = require("mongoose");
const Staff = require("./Staff");
const Student = require("./Student");
const Department = require("./Department");
const Class = require("./Class");
const Subject = require("./Subject");

const roleSchema = new mongoose.Schema({
  userSelectStaffRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  userSelectStudentRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
});

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
