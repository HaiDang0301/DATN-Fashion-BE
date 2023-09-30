const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);
const Blogs = new Schema(
  {
    image: { type: String, required: true },
    title: { type: String, required: true },
    public_id: { type: String, required: true },
    author: { type: String, min: 6, max: 20, required: true },
    description: { type: String, required: true },
    slug: { type: String, slug: "title" },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Blogs", Blogs);
