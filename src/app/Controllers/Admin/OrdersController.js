const Orders = require("../../Models/OrdersModel");
const WareHouse = require("../../Models/WareHouse");
const Products = require("../../Models/ProductsModel");
class OrdersController {
  async index(req, res, next) {
    let orders = {};
    const orders_code = req.query.orders_code;
    let bySort = { createdAt: "desc" };
    const limit = 9;
    const page = req.query.page;
    let countOrders = await Orders.countDocuments();
    let totalPage = Math.ceil(countOrders / limit);
    const query = req.query.sort;
    const begin = req.query.begin;
    const final = req.query.final;
    if (orders_code) {
      orders = { orders_code: orders_code };
    }
    switch (query) {
      case query:
        if (query === "pending") {
          orders = { status_delivery: "Pending" };
          const countOrders = await Orders.find(orders).countDocuments();
          totalPage = Math.ceil(countOrders / limit);
        }
        if (query === "delivery") {
          orders = { status_delivery: "Delivery" };
          const countOrders = await Orders.find(orders).countDocuments();
          totalPage = Math.ceil(countOrders / limit);
        }
        if (query === "cancel") {
          orders = { status_delivery: "Cancel" };
          const countOrders = await Orders.find(orders).countDocuments();
          totalPage = Math.ceil(countOrders / limit);
        }
        if (query === "delivered") {
          orders = { status_delivery: "Successful Delivery" };
          const countOrders = await Orders.find(orders).countDocuments();
          totalPage = Math.ceil(countOrders / limit);
        }
        if (query === "decrease") {
          bySort = { totalMoney: "desc" };
        }
        if (query === "increase") {
          bySort = { totalMoney: "asc" };
        }
        break;
    }
    if (begin && final) {
      orders = {
        createdAt: { $gte: new Date(begin), $lte: new Date(final) },
      };
      const countOrders = await Orders.find(orders).countDocuments();
      totalPage = Math.ceil(countOrders / limit);
    }
    try {
      const findOrders = await Orders.find(orders)
        .sort(bySort)
        .skip((page - 1) * limit)
        .limit(limit);
      res.status(200).json({ findOrders, totalPage, countOrders });
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async show(req, res, next) {
    const id = req.params.id;
    try {
      const orders = await Orders.findOne({ _id: id });
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async update(req, res, next) {
    const status = req.body.status;
    const id = req.params.id;
    const reason = req.body.reason;
    let order = {};
    switch (status) {
      case status:
        if (status === "delivery") {
          order = { status_delivery: "Delivery" };
        }
        if (status === "cancel") {
          order = {
            status_delivery: "Cancel",
            reason_cancel: reason,
          };
        }
        if (status === "success") {
          order = {
            status_delivery: "Successful Delivery",
            status_payment: true,
          };
          let dataUpdateProduct = {};
          let dataImport = [];
          let month = new Date().getMonth() + 1;
          if (month === 13) month = "01";
          if (month.length < 2) month = "0" + month;
          const findOrders = await Orders.findById({ _id: id });
          findOrders.orders.forEach(async (product) => {
            dataImport.push({
              product_id: product.product_id,
              product_name: product.product_name,
              price: product.price,
              sizes: [
                {
                  size: product.size,
                  quantity: product.quantity,
                },
              ],
              createdAt: Date.now(),
              type: 1,
              totalMoney: findOrders.totalMoney,
            });
            let sizes = [
              {
                size: product.size,
                quantity: product.quantity,
              },
            ];
            const findProduct = await Products.findById({
              _id: product.product_id,
            });
            findProduct.sizes.map((product) => {
              sizes.unshift(product);
            });
            const result = {};
            sizes.forEach((obj) => {
              const { size, quantity } = obj;
              if (result.hasOwnProperty(size)) {
                result[size] -= quantity;
              } else {
                result[size] = quantity;
              }
            });
            let objsizes = {
              size: Object.keys(result),
              quantity: Object.values(result),
            };
            let arrSizes = [];
            for (let i = 0; i < objsizes.size.length; i++) {
              arrSizes.push({
                size: objsizes.size[i],
                quantity: objsizes.quantity[i],
              });
              arrSizes.filter(async (size) => {
                if (size.quantity < 50) {
                  dataUpdateProduct = {
                    $set: { sizes: arrSizes, status: 1 },
                  };
                } else {
                  dataUpdateProduct = {
                    $set: { sizes: arrSizes },
                  };
                }
              });
              await Products.findByIdAndUpdate(
                { _id: product.product_id },
                dataUpdateProduct
              );
            }
          });
          dataImport.map(async (data) => {
            const findMonth = await WareHouse.findOne({
              years: new Date().getFullYear(),
              months: { $elemMatch: { month: month } },
            });
            if (findMonth) {
              await WareHouse.findOneAndUpdate(
                {
                  years: new Date().getFullYear(),
                  months: { $elemMatch: { month: month } },
                },
                {
                  $push: {
                    "months.$.data": data,
                  },
                  $inc: {
                    "months.$.sales_Money":
                      findOrders.totalMoney / dataImport.length,
                  },
                }
              );
            } else {
              await WareHouse.findOneAndUpdate(
                {
                  years: new Date().getFullYear(),
                },
                {
                  $addToSet: {
                    months: {
                      month: month,
                      data: data,
                      sales_Money: findOrders.totalMoney,
                    },
                  },
                },
                { upsert: true }
              );
            }
          });
        }
        break;
    }
    try {
      await Orders.findByIdAndUpdate({ _id: id }, order);
      res.status(200).json("Update Status Order Success");
    } catch (error) {
      res.status(500).json("Connect Server Errors");
    }
  }
  async destroy(req, res, next) {
    const id = req.params.id;
    try {
      await Orders.findByIdAndDelete({ _id: id });
      res.status(200).json("Delete Order Success");
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new OrdersController();
