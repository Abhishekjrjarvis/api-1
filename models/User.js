const mongoose = require("mongoose");
const UserPost = require("./userPost");
const Staff = require("./Staff");
const InstituteAdmin = require("./InstituteAdmin");
const Student = require("./Student");
const UserAnnouncement = require("./UserAnnouncement");

const userSchema = new mongoose.Schema({
  userPhoneNumber: { type: Number, required: true, maxlength: 10 },
  userEmail: { type: String },
  userPassword: { type: String, minlength: 10 },
  userStatus: { type: String, default: "Not Verified" },
  username: { type: String, required: true, unique: true },
  userLegalName: { type: String },
  userDateOfBirth: { type: String },
  userGender: { type: String },
  userAddress: { type: String },
  userBio: { type: String },
  userPassword: { type: String },
  userAbout: { type: String },
  userCity: { type: String },
  userState: { type: String },
  userCountry: { type: String },
  userHobbies: { type: String },
  userEducation: { type: String },
  referalPercentage: { type: String },
  profilePhoto: { type: String },
  profileCoverPhoto: { type: String },
  photoId: { type: String },
  coverId: { type: String },
  userPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPost",
    },
  ],
  staff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  userFollowers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  userFollowing: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  userCircle: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  userInstituteFollowing: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  InstituteReferals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  announcement: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAnnouncement",
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
