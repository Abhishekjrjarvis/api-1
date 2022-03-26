const mongoose = require("mongoose");
const Video = require("./Video");
const ResourcesKey = require("./ResourcesKey");
const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  resourceKeys: [{ type: mongoose.Schema.Types.ObjectId, ref: "ResourcesKey" }],
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
  },
});

// resourceSchema.post("findOneAndDelete", async (arg) => {
//   if (arg) {
//     await ResourcesKey.deleteMany({
//       _id: {
//         $in: arg.resourceKeys,
//       },
//     });
//   }
// });

module.exports = mongoose.model("Resource", resourceSchema);
