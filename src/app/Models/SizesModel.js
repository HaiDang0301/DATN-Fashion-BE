const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Size = new Schema({
  sizes: { type: String, unique: true, required: true },
});
module.exports = mongoose.model("Size", Size);
