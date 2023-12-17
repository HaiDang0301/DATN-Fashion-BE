const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Collection = new Schema(
  {
    collections: { type: String, required: true, unique: true },
    image: { type: String },
    public_id: { type: String },
    categories: [
      {
        category: { type: String },
      },
    ],
    showHome: { type: String, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Collection", Collection);
