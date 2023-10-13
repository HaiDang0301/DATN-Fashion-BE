const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Banner = new Schema(
  {
    image: { type: String },
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true, unique: true },
    public_id: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Banner", Banner);
