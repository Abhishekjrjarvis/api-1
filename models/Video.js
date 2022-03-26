const mongoose = require("mongoose");
const Topic = require("./Topic");
const Resource = require("./Resource");
const VideoComment = require("./VideoComment");
const User = require("./User");
const videoSchema = new mongoose.Schema({
  fileName:{type:String},
  name: { type: String, required: true },
  access: { type: String, default: "Paid" },
  price: { type: Number, default: 0 },
  videoName:{
    type:String,
  },
  video: { type: String },
  videoTime: {
    type: String,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resource",
  },

  userLike: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  userSave: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  userComment: [{ type: mongoose.Schema.Types.ObjectId, ref: "VideoComment" }],
  createdAt: { type: Date, default: Date.now },
});

// videoSchema.post("findOneAndDelete", async (arg) => {
//   if (arg) {
//     console.log(arg);
//     for (let me of arg.resource) {
//       deleteFile(me);
//     }
//     console.log(
//       await Resource.deleteMany({
//         _id: {
//           $in: arg.resource,
//         },
//       })
//     );
//   }
// });
module.exports = mongoose.model("Video", videoSchema);
