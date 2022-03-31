const mongoose = require("mongoose");

const Class = require("./Class");

const Department = require("./Department");

const Student = require("./Student");

const electionsSchema = new mongoose.Schema({
  electionForDepartment: {
    type: mongoose.Schema.Types.ObjectId,

    ref: "Department",
  },

  positionName: { type: String },

  applicationDate: { type: Date },

  electionDate: { type: Date },

  totalVoters: { type: Number },

  winnerCandidates: {
    winner: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Student",
    },

    runnerUp: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Student",
    },

    runnerUp2: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Student",
    },
  },

  voteCount: [
    {
      voterId: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Student",
      },

      votedTo: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Student",
      },
    },
  ],

  candidates: [
    {
      selectionStatus: { type: String, default: "Not Selected" },

      vote: { type: Number, default: 0 },

      studentName: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Student",
      },
    },
  ],
});

const Elections = mongoose.model("Elections", electionsSchema);

module.exports = Elections;
