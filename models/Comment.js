const mongoose = require("mongoose");
const Post = require("./Post");
const InstituteAdmin = require("./InstituteAdmin");
const User = require("./User");

const commentSchema = new mongoose.Schema({
  commentDesc: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  institutes: {
    type: "String",
  },
  instituteUser: {
    type: "String",
  },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
