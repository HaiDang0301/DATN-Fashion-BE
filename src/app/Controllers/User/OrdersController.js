const Orders = require("../../Models/OrdersModel");
class OrdersController {
  async index(req, res, next) {
    const id = req.user.id;
    try {
      const orders = await Orders.find({ user_id: id });
      res.status(200).json(orders);
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
