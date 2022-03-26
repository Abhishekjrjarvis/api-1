const mongoose = require("mongoose");
const Staff = require('./Staff')
const InstituteAdmin = require('./InstituteAdmin')

const groupConversationSchema = new mongoose.Schema({
    members: {
        type: Array
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupConversation", groupConversationSchema);