const Products = require("../../Models/ProductsModel");
class ProductsController {
  async index(req, res, next) {
    let cateria = null;
    let bySort = { createdAt: "desc" };
    let limit = req.query.limit || 6;
    const producer = req.query.producer;
    const min = req.query.min;
    const max = req.query.max;
    const page = req.query.page;
    const type = req.params.type;
    const category = req.params.category;
    const query = req.query.sort;
    const countDoc = await Products.countDocuments();
    let totalPage = Math.ceil(countDoc / limit);
    switch (type) {
      case type:
        if (type === "new-products") {
          cateria = {
            createdAt: {
              $lt: new Date(),
              $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          };
          const countDoc = await Products.find(cateria).countDocuments();
          totalPage = Math.ceil(countDoc / limit);
        }
        if (type === "sale") {
          cateria = {
            $and: [
              { promotion: { $gt: 0 } },
              { out_of_promotion: { $gt: Date.now() } },
            ],
          };
          const countDoc = await Products.find(cateria).countDocuments();
          totalPage = Math.ceil(countDoc / limit);
        }
        if (type != "new-products" && type != "sale") {
          cateria = { collections: type };
          const countDoc = await Products.find(cateria).countDocuments();
          totalPage = Math.ceil(countDoc / limit);
        }
        break;
    }
    if (!type) {
      cateria = {};
      const countDoc = await Products.find(cateria).countDocuments();
      totalPage = Math.ceil(countDoc / limit);
    }
    if (type && category) {
      cateria = {
        $and: [{ collections: type }, { category: category }],
      };
      const countDoc = await Products.find(cateria).countDocuments();
      totalPage = Math.ceil(countDoc / limit);
    }
    switch (query) {
      case query:
        if (query === "name") {
          bySort = { name: "desc" };
        }
        if (query === "price") {
          bySort = { price: "desc" };
        }
        break;
    }
    if (producer) {
      cateria = { producer: producer };
      const countDoc = await Products.find(cateria).countDocuments();
      totalPage = Math.ceil(countDoc / limit);
    }
    if (min && max) {
      cateria = { price: { $gt: min, $lt: max } };
      const countDoc = await Products.find(cateria).countDocuments();
      totalPage = Math.ceil(countDoc / limit);
    }

    try {
      const products = await Products.find(cateria)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort(bySort);
      res.status(200).json({ products, totalPage });
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new ProductsController();
