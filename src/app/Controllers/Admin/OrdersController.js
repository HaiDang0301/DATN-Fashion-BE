const Orders = require("../../Models/OrdersModel");
class OrdersController {
  async index(req, res, next) {
    let orders = {};
    try {
      const findOrders = await Orders.find(orders);
      res.status(200).json(findOrders);
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
    const id = req.body.id;
    const reason = req.body.reason;
    let order = {};
    switch (status) {
      case status:
        if (status === "delivery") {
          order = { status_delivery: "Delivery" };
        }
        if (status === "cancel") {
          order = { status_delivery: "Cancel", reason_cancel: reason };
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
}
module.exports = new OrdersController();
