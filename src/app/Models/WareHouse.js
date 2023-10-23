const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const WareHouse = new Schema(
  {
    product_id: { type: String },
    price: { type: Number },
    sizes: [
      {
        size: { type: String },
        quantity: { type: Number },
      },
    ],
    type: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("WareHouse", WareHouse);
