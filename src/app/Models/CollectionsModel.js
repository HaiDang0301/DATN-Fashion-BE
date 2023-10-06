const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Collection = new Schema(
  {
    collections: { type: String, required: true, unique: true },
    categories: [
      {
        category: { type: String },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Collection", Collection);
