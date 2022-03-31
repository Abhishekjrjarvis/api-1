const mongoose = require("mongoose");
const UserPost = require("./userPost");
const Staff = require("./Staff");
const InstituteAdmin = require("./InstituteAdmin");
const Student = require("./Student");
const UserAnnouncement = require("./UserAnnouncement");
const Post = require("./Post");
const Role = require("./Role");
const Conversation = require("./Conversation");
const Video = require("./Video");
const Playlist = require("./Playlist");
const UserSupport = require("./UserSupport");
const PreAppliedStudent = require("./PreAppliedStudent");
const DepartApplication = require("./DepartmentApplication");
const PlaylistPayment = require("./PlaylistPayment");

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
  referalPercentage: { type: Number, default: 0 },
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
  saveUsersPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPost",
    },
  ],
  saveUserInsPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
  },
  addUser: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  addUserInstitute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  activeStatus: {
    type: String,
    default: "Activated",
  },
  activeDate: {
    type: String,
  },
  videoLike: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  videoSave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  watchLater: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  playlistJoin: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],
  playlistPayment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlaylistPayment",
    },
  ],
  videoPurchase: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  applicationPaymentList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DepartmentApplication'
    }
  ],
  admissionPaymentList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DepartmentApplication'
    }
  ],
  transferInstitute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  support: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSupport",
    },
  ],
  createdAt: {
    type: String,
  },
  remindLater: {
    type: String,
  },
  appliedForApplication: [
    {
      appName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DepartmentApplication",
      },
      appUpdates: [
        {
          notificationType: { type: Number },
          notification: { type: String },
          actonBtnText: { type: String },
          deActBtnText: { type: String },
        },
      ],
    },
  ],
  preAppliedStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PreAppliedStudent",
    },
  ],
});

userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await UserPost.deleteMany({
      _id: {
        $in: doc.userPosts,
      },
    });
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
