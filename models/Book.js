const mongoose = require("mongoose");
const Library = require("./Library");
const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  photoId: { type: String },
  photo: { type: String },
  author: { type: String, required: true },
  totalPage: { type: Number, required: true },
  language: { type: String, required: true },
  price: { type: String, required: true },
  publication: { type: String, required: true },
  totalCopies: { type: Number, required: true },
  shellNumber: { type: String, required: true },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
});

module.exports = mongoose.model("Book", bookSchema);
