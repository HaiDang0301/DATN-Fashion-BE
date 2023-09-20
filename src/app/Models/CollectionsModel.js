const mongoose = require("mongoose");
const Schema = mongoose.Schema;
slug = require("mongoose-slug-generator");
mongoose.plugin(slug);
const Collection = new Schema(
  {
    collections: { type: String, required: true, unique: true },
    categories: [
      {
        name: { type: String, required: true, unique: true },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Collection", Collection);
