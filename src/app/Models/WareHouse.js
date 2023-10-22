const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const WareHouse = new Schema(
  {
    product_id: { type: String },
    price: { type: String },
    sizes: [
      {
        size: { type: String },
        quantity: { type: String },
      },
    ],
    type: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("WareHouse", WareHouse);
