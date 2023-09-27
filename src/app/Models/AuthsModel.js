const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Account = new Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cart: [
      {
        orders: [
          {
            image: { type: String },
            product_name: { type: String },
            quantity: { type: String },
            size: { type: String },
            color: { type: String },
            producer: { type: String },
            colection: { type: String },
            category: { type: String },
            total_money: { type: String },
          },
        ],
      },
    ],
    address: [
      {
        phone: { type: String },
        city: { type: String },
        ward: { type: String },
        district: { type: String },
        village: { type: String },
      },
    ],
    last_purchase: { type: Date },
    role: { type: String, default: "client" },
    last_time_login: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Account", Account);
