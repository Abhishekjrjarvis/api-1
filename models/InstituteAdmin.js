const mongoose = require("mongoose");
const Department = require("./Department");
const Post = require("./Post");
const InsAnnouncement = require("./InsAnnouncement");
const Staff = require("./Staff");
const User = require("./User");
const Class = require("./Class");
const Student = require("./Student");
const UserPost = require("./userPost");
const InstituteSupport = require('./InstituteSupport')

const instituteAdminSchema = new mongoose.Schema({
  insName: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  insEmail: { type: String, required: true, unique: true },
  insPhoneNumber: { type: Number, required: true, maxlength: 10 },
  insState: { type: String, required: true },
  insDistrict: { type: String, required: true },
  insPincode: { type: Number, required: true },
  insAddress: { type: String },
  insAbout: { type: String },
  insMode: { type: String, required: true },
  insDocument: { type: String },
  insPassword: { type: String },
  insType: { type: String, required: true },
  status: { type: String, default: "Not Approved" },
  insProfilePassword: { type: String },
  insOperatingAdmin: { type: String },
  insStudentPresident: { type: String },
  insPrinciple: { type: String },
  insTrusty: { type: String },
  insAdminClerk: { type: String },
  insEstdDate: { type: Date },
  // insRegNumber: { type: Number, required: true, unique: true },
  insAchievement: { type: String },
  insAffiliated: { type: String },
  referalPercentage: { type: String },
  rejectReason: { type: String },
  insEditableText: { type: String },
  insEditableTexts: { type: String },
  referalStatus: { type: String, default: "Pending" },
  insProfilePhoto: { type: String },
  insProfileCoverPhoto: { type: String },
  photoId: { type: String },
  coverId: { type: String },
  createdAt: { type: Date, default: Date.now },
  staffJoinCode: { type: String },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  announcement: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsAnnouncement",
    },
  ],
  staff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  ApproveStaff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  depart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  userFollowersList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  classRooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  ApproveStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  saveInsPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  saveUserPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPost",
    },
  ],
  supportIns: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstituteSupport'
    }
  ]
});

const InstituteAdmin = mongoose.model("InstituteAdmin", instituteAdminSchema);

module.exports = InstituteAdmin;
