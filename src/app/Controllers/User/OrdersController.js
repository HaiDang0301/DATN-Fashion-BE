const Orders = require("../../Models/OrdersModel");
class OrdersController {
  async index(req, res, next) {
    const id = req.user.id;
    let orders = {};
    let bySort = { createdAt: "desc" };
    const limit = 9;
    const page = req.query.page;
    let countPage = await Orders.countDocuments();
    let totalPage = Math.ceil(countPage / limit);
    const query = req.query.sort;
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
    try {
      const findOrders = await Orders.find({
        $and: [{ user_id: id }, orders],
      })
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
}
module.exports = new OrdersController();
