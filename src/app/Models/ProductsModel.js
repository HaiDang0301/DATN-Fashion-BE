const mongoose = require("mongoose");
const Schema = mongoose.Schema;
slug = require("mongoose-slug-generator");
mongoose.plugin(slug);
const Product = new Schema(
  {
    image: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    quantity: { type: String, required: true },
    productCode: { type: String },
    collections: { type: String, required: true },
    category: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    importPrice: { type: String, required: true },
    saleProduct: { type: String, required: true },
    promotion: { type: String, default: 0 },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, slug: "name" },
    status: { type: String, default: "Stocking" },
    comment: [
      {
        _id: { type: String },
        body: { type: String },
      },
    ],
    startrate: [
      {
        rate: { type: String },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Product", Product);
