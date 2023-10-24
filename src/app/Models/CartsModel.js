const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Cart = new Schema({
  user_id: { type: String, require: true },
  carts: [
    {
      product_id: { type: String, require: true },
      product_name: { type: String, require: true },
      image: { type: String, require: true },
      size: { type: String, require: true },
      quantity: { type: String, require: true },
      price: { type: Number, require: true },
    },
  ],
});
module.exports = mongoose.model("Cart", Cart);
