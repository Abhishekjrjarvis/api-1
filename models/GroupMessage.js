const mongoose = require("mongoose");
const GroupConversation = require('./GroupConversation')

const groupMessageSchema = new mongoose.Schema({
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupConversation'
    },
    sender: {
      type: String,
    },
    text: {
      type: String,
    },
    photo: {
        type: String
    },
    video: {
        type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupMessage", groupMessageSchema);