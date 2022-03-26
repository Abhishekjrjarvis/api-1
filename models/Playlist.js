const mongoose = require("mongoose");
const ELearning = require("./ELearning");
const Topic = require("./Topic");
const User = require("./User");
const Class = require("./Class");
const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String },
  by: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true },
  playtime: { type: String, required: true },
  value: { type: String, default: "Paid" },
  price: { type: String, default: 0 },
  time: { type: Number, default: 0 },
  lecture: { type: Number, default: 0 },
  salse: { type: Number, default: 0 },
  enroll: { type: Number, default: 0 },
  access: { type: String, default: "No" },
  color: {
    type: String,
    default: "#1A5DB4",
  },
  class: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  elearning: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ELearning",
  },
  joinNow: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  topic: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
});

// playlistSchema.post("findOneAndDelete", async (arg) => {
//   if (arg) {
//     await Topic.deleteMany({
//       _id: {
//         $in: arg.topic,
//       },
//     });
//   }
// });

module.exports = mongoose.model("Playlist", playlistSchema);
