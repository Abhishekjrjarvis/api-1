const mongoose = require("mongoose");
const Staff = require("./Staff");
const InstituteAdmin = require("./InstituteAdmin");
const Playlist = require("./Playlist");
const ELearningSchema = new mongoose.Schema({
  elearningHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  emailId: { type: String },
  phoneNumber: { type: String },
  photoId: { type: String },
  photo: { type: String },
  coverId: { type: String },
  cover: { type: String },
  vision: { type: String },
  mission: { type: String },
  about: { type: String },
  playlist: { type: String },
  susbcriber: { type: String },
  award: { type: String },
  achievement: { type: String },
  activities: { type: String },
  createdAt: { type: Date, default: Date.now },
  playlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],
  bankBalance: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("ELearning", ELearningSchema);
