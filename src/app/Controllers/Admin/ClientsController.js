const Accounts = require("../../Models/AuthsModel");
class ClientsController {
  async index(req, res, next) {
    const query = req.query.q;
    let page = req.query.page;
    let limit = 9;
    let countClients = await Accounts.countDocuments();
    let totalPage = Math.ceil(countClients / limit);
    let queryClients = {};
    let bySort = { createdAt: "desc" };
    try {
      if (query === "name_clients") {
        bySort = { full_name: "desc" };
      }
      if (query === "not_verify") {
        queryClients = { verify: false };
        const countClients = await Accounts.find(queryClients).countDocuments();
        totalPage = Math.ceil(countClients / limit);
      }
      if (query === "not_login") {
        queryClients = {
          last_time_login: {
            $lte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        };
        const countClients = await Accounts.find(queryClients).countDocuments();
        totalPage = Math.ceil(countClients / limit);
      }
      const clients = await Accounts.find(queryClients)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(bySort);
      res.status(200).json({ clients, totalPage, countClients });
    } catch (error) {
      res.status(500).json("Connect Server Error");
    }
  }
}
module.exports = new ClientsController();
