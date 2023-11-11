const Accounts = require("../../Models/AuthsModel");
class ClientsController {
  async index(req, res, next) {
    try {
      const clients = await Accounts.find({});
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json("Connect Server Error");
    }
  }
}
module.exports = new ClientsController();
