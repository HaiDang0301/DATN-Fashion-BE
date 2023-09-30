const mongose = require("mongoose");
const Schema = mongose.Schema;
const Producer = new Schema(
  {
    name: { type: String, unique: true, required: true },
    address: { type: String, required: true },
    phone_number: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    status: { type: String, default: "Providing" },
    contract_sign_date: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);
module.exports = mongose.model("Producer", Producer);
