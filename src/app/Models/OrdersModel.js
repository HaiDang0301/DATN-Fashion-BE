const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Orders = new Schema(
  {
    user_id: { type: String, require: true },
    full_name: { type: String, require: true },
    email: { type: String, require: true },
    phone: { type: String, require: true },
    orders: [
      {
        product_id: { type: String, require: true },
        product_name: { type: String, require: true },
        image: { type: String, require: true },
        size: { type: String, require: true },
        quantity: { type: Number, require: true },
        price: { type: Number, require: true },
      },
    ],
    totalMoney: { type: Number, require: true },
    address: {
      city: { type: String, required: true },
      district: { type: String, required: true },
      ward: { type: String, required: true },
      address_home: { type: String, required: true },
    },
    status_delivery: { type: String, default: "Pending" },
    status_payment: { type: Boolean, default: false },
    reason_cancel: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Order", Orders);
