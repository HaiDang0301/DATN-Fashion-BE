const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const WareHouse = new Schema(
  {
    years: { type: String },
    months: [
      {
        month: { type: String },
        data: [
          {
            product_id: { type: String },
            product_name: { type: String },
            price: { type: Number },
            sizes: [
              {
                size: { type: String },
                quantity: { type: Number },
              },
            ],
            type: { type: Number },
            createdAt: { type: Date },
            totalMoney: { type: Number },
          },
        ],
        import_Money: { type: Number, default: 0 },
        sales_Money: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("WareHouse", WareHouse);
