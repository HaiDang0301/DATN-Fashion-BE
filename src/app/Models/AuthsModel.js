const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Account = new Schema(
  {
    image: {
      url: { type: String },
      public_id: { type: String },
    },
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    carts: [
      {
        cart: [
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
    phone: { type: String },
    address: {
      city: { type: String },
      district: { type: String },
      ward: { type: String },
      address_home: { type: String },
    },
    last_purchase: { type: Date },
    Registered: { type: String, default: "Not Yet" },
    role: { type: String, default: "client" },
    last_time_login: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Account", Account);
