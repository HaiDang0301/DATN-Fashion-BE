const Products = require("../../Models/ProductsModel");
const Collections = require("../../Models/CollectionsModel");
class HomeController {
  async collectionShow(req, res, next) {
    try {
      const collections = await Collections.find({ showHome: "true" });
      res.status(200).json(collections);
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async sale(req, res, next) {
    const limit = 20;
    var cateria = {
      $and: [
        { promotion: { $gt: 0 } },
        { out_of_promotion: { $gt: Date.now() } },
      ],
    };
    try {
      const product = await Products.find(cateria)
        .sort({ createdAt: "desc" })
        .limit(limit);
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new HomeController();
