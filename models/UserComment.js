const mongoose = require("mongoose");
const UserPost = require("./userPost");
const InstituteAdmin = require("./InstituteAdmin");
const User = require("./User");

const userCommentSchema = new mongoose.Schema({
  userCommentDesc: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userpost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserPost",
  },
  userInstitute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstituteAdmin'
  },
  users: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
});

const UserComment = mongoose.model("UserComment", userCommentSchema);

module.exports = UserComment;
