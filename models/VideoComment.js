const mongoose = require("mongoose");
const User = require("./User");
const Video = require("./Video");
const videoCommentSchema = new mongoose.Schema({
  comment: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("VideoComment", videoCommentSchema);
