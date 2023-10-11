const mongose = require("mongoose");
const Schema = mongose.Schema;
const Producer = new Schema(
  {
    name: { type: String, unique: true, required: true },
    address: { type: String },
    phone_number: { type: String },
    email: { type: String },
    status: { type: String, default: "Providing" },
    contract_sign_date: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);
module.exports = mongose.model("Producer", Producer);
