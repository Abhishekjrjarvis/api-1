const mongoose = require("mongoose");
const Resource = require("./Resource");
const resourcesKeySchema = new mongoose.Schema({
  resourceName: {
    type: String,
  },
  resourceKey: {
    type: String,
    required: true,
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resource",
  },
});

module.exports = mongoose.model("ResourcesKey", resourcesKeySchema);
