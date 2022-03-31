const mongoose = require("mongoose");
const InstituteAdmin = require("./InstituteAdmin");
const Comment = require("./Comment");
const User = require("./User");

const postSchema = new mongoose.Schema({
  CreateInsPost: {
    type: String,
  },
  CreateImage: {
    type: String,
  },
  imageId: {
    type: String,
  },
  CreateVideo: {
    type: String,
  },
  // caption: {
  //     type: String
  // },
  // CreateInsLocation: {
  //     type: String
  // },
  CreatePostStatus: {
    type: String,
    default: "Anyone",
  },
  insLike: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  insUserLike: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  comment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

postSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Comment.deleteMany({
      _id: {
        $in: doc.comment,
      },
    });
  }
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
