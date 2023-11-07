const Products = require("../../Models/ProductsModel");
class ProductsController {
  async index(req, res, next) {
    let cateria = null;
    let bySort = { createdAt: "desc" };
    let limit = req.query.limit || 8;
    const producer = req.query.producer;
    const name = req.query.name;
    const min = req.query.min;
    const max = req.query.max;
    const page = req.query.page;
    const type = req.params.type;
    const category = req.params.category;
    const query = req.query.sort;
    const countDoc = await Products.countDocuments();
    let totalPage = Math.ceil(countDoc / limit);
    if (type && category) {
      cateria = {
        $and: [{ collections: type }, { category: category }],
      };
      const countDoc = await Products.find(cateria).countDocuments();
      totalPage = Math.ceil(countDoc / limit);
    }
    if (type && !category) {
      cateria = { collections: type };
      const countDoc = await Products.find(cateria).countDocuments();
      totalPage = Math.ceil(countDoc / limit);
    }
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
        break;
    }
    if (!type) {
      cateria = {};
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
      if (category) {
        cateria = {
          $and: [
            { collections: type },
            { category: category },
            { producer: producer },
          ],
        };
      } else {
        cateria = {
          producer: producer,
        };
      }
      const countDoc = await Products.find(cateria).countDocuments();
      totalPage = Math.ceil(countDoc / limit);
    }
    if (min && max) {
      if (type == "new-products") {
        cateria = {
          $and: [
            (cateria = {
              createdAt: {
                $lt: new Date(),
                $gte: new Date(new Date().setDate(new Date().getDate() - 15)),
              },
            }),
            { price: { $gt: min, $lt: max } },
          ],
        };
      }
      if (type === "sale") {
        cateria = {
          $and: [
            { promotion: { $gt: 0 } },
            { out_of_promotion: { $gt: Date.now() } },
            { price: { $gt: min, $lt: max } },
          ],
        };
      }
      if (type !== "sale" && type !== "new-products") {
        cateria = {
          $and: [{ collections: type }, { price: { $gt: min, $lt: max } }],
        };
      }
      if (category) {
        cateria = {
          $and: [
            { collections: type },
            { category: category },
            { price: { $gt: min, $lt: max } },
          ],
        };
      }
      const countDoc = await Products.find(cateria).countDocuments();
      totalPage = Math.ceil(countDoc / limit);
    }
    if (name) {
      cateria = { name: { $regex: name } };
      const countProducts = await Products.find(cateria).countDocuments();
      totalPage = Math.ceil(countProducts / limit);
    }
    try {
      const products = await Products.find(cateria)
        .sort(bySort)
        .skip((page - 1) * limit)
        .limit(limit);
      res.status(200).json({ products, totalPage });
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async show(req, res, next) {
    try {
      const slug = req.params.slug;
      const product = await Products.findOne({ slug: slug });
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json("Can't Find Product");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new ProductsController();
