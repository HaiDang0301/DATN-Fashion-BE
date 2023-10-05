const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Color = new Schema({
  color: { type: String, unique: true, required: true },
});
module.exports = mongoose.model("Color", Color);
