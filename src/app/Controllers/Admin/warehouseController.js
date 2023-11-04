const WareHouse = require("../../Models/WareHouse");
class WareHouseController {
  async index(req, res, next) {
    const dataWarehouse = await WareHouse.findOne({});
  }
}
module.exports = new WareHouseController();
