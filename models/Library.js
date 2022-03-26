const mongoose = require("mongoose");
const Student = require("./Student");
const Staff = require("./Staff");
const Book = require("./Book");
const Issue = require("./Issue");
const Collect = require("./Collect");
const InstituteAdmin = require("./InstituteAdmin");
const librarySchema = new mongoose.Schema({
  libraryHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  emailId: { type: String },
  phoneNumber: { type: String },
  about: { type: String },
  photoId: { type: String },
  photo: { type: String },
  coverId: { type: String },
  cover: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  issues: [{ type: mongoose.Schema.Types.ObjectId, ref: "Issue" }],
  collects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collect" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Library", librarySchema);
