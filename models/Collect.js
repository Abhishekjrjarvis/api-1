const mongoose = require("mongoose");
const Student = require("./Student");
const Book = require("./Book");
const Library = require("./Library");

const collectSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Collect", collectSchema);
