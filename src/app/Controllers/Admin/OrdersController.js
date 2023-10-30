const Orders = require("../../Models/OrdersModel");
class OrdersController {
  async index(req, res, next) {
    let orders = {};
    const orders_code = req.query.orders_code;
    let bySort = { createdAt: "desc" };
    const limit = 9;
    const page = req.query.page;
    let countPage = await Orders.countDocuments();
    let totalPage = Math.ceil(countPage / limit);
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
          const countPage = await Orders.find(orders).countDocuments();
          totalPage = Math.ceil(countPage / limit);
        }
        if (query === "delivery") {
          orders = { status_delivery: "Delivery" };
          const countPage = await Orders.find(orders).countDocuments();
          totalPage = Math.ceil(countPage / limit);
        }
        if (query === "cancel") {
          orders = { status_delivery: "Cancel" };
          const countPage = await Orders.find(orders).countDocuments();
          totalPage = Math.ceil(countPage / limit);
        }
        if (query === "delivered") {
          orders = { status_delivery: "Successful Delivery" };
          const countPage = await Orders.find(orders).countDocuments();
          totalPage = Math.ceil(countPage / limit);
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
      const countPage = await Orders.find(orders).countDocuments();
      totalPage = Math.ceil(countPage / limit);
    }
    try {
      const findOrders = await Orders.find(orders)
        .sort(bySort)
        .skip((page - 1) * limit)
        .limit(limit);
      res.status(200).json({ findOrders, totalPage });
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
          order = { status_delivery: "Delivery", status_payment: false };
        }
        if (status === "cancel") {
          order = {
            status_delivery: "Cancel",
            reason_cancel: reason,
            status_payment: false,
          };
        }
        if (status === "success") {
          order = {
            status_delivery: "Successful Delivery",
            status_payment: true,
          };
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
