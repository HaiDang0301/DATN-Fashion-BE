const mongoose = require("mongoose");
const Schema = mongoose.Schema;
slug = require("mongoose-slug-generator");
mongoose.plugin(slug);
const Product = new Schema(
  {
    image: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],
    name: { type: String, required: true, unique: true },
    productCode: { type: String },
    collections: { type: String, required: true },
    category: { type: String, required: true },
    sizes: [
      {
        size: { type: String },
        quantity: { type: Number },
      },
    ],
    color: { type: String, required: true },
    importPrice: { type: Number, required: true },
    price: { type: Number, required: true },
    old_price: { type: Number },
    promotion: { type: Number, default: 0 },
    producer: { type: String, required: true },
    description: { type: String, required: true },
    quantity_sold: [
      {
        size: { type: String },
        quantity: { type: Number },
        date_sold: { type: Date },
      },
    ],
    out_of_promotion: { type: Date, default: Date.now() },
    slug: { type: String, slug: "name" },
    status: { type: String, default: "Stocking" },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Product", Product);
