const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const WareHouse = new Schema(
  {
    years: [
      {
        year: { type: Date },
        months: [
          {
            month: { type: Date },
            data: [
              {
                product_id: { type: String },
                price: { type: Number },
                sizes: [
                  {
                    size: { type: String },
                    quantity: { type: Number },
                  },
                ],
                type: { type: String },
              },
            ],
            totalMoney: { type: Number },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("WareHouse", WareHouse);
