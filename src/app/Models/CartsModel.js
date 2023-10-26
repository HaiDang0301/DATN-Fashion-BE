const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Orders = new Schema({
  user_id: { type: String, require: true },
  oders: [
    {
      product_id: { type: String, require: true },
      product_name: { type: String, require: true },
      image: { type: String, require: true },
      size: { type: String, require: true },
      quantity: { type: Number, require: true },
      price: { type: Number, require: true },
    },
  ],
  address: {
    city: { type: String },
    district: { type: String },
    ward: { type: String },
    address_home: { type: String },
  },
});
module.exports = mongoose.model("Order", Orders);
