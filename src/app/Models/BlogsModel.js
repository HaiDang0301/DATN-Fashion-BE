const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);
const Blogs = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, slug: "title" },
});
module.exports = mongoose.model("Blogs", Blogs);
