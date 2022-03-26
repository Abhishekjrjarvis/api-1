const mongoose = require("mongoose");
const Video = require("./Video");
const Playlist = require("./Playlist");
const topicSchema = new mongoose.Schema({
  topicName: { type: String, required: true },
  playlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Playlist",
  },
  video: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
});
// topicSchema.post("findOneAndDelete", async (arg) => {
//   if (arg) {
//     await Video.deleteMany({
//       _id: {
//         $in: arg.video,
//       },
//     });
//   }
// });
module.exports = mongoose.model("Topic", topicSchema);
