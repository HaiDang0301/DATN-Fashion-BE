const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Account = new Schema(
  {
    image: {
      url: { type: String },
      public_id: { type: String },
    },
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    carts: [
      {
        product_id: { type: String, require: true },
        product_name: { type: String, require: true },
        image: { type: String, require: true },
        size: { type: String, require: true },
        quantity: { type: Number, require: true },
        price: { type: Number, require: true },
      },
    ],
    phone: { type: String },
    address: {
      city: { type: String },
      district: { type: String },
      ward: { type: String },
      address_home: { type: String },
    },
    authFacebookID: {
      type: String,
      default: null,
    },
    authGoogleID: {
      type: String,
      default: null,
    },
    authType: {
      type: String,
      enum: ["local", "facebook", "google"],
      default: "local",
    },
    last_purchase: { type: Date },
    registered: { type: Boolean, default: false },
    verify: { type: Boolean },
    role: { type: String, default: "client" },
    last_time_login: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Account", Account);
