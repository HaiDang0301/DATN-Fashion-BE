const Products = require("../Models/ProductsModel");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});
class ProductsController {
  async index(req, res, next) {
    let cateria = {};
    let bysort = {};
    const page = req.query.page;
    const limit = 1;
    const countProducts = await Products.countDocuments();
    const totalPage = Math.ceil(countProducts / limit);
    const collections = req.params.collections;
    const brand = req.query.brand;
    const color = req.query.color;
    const price = req.query.price;
    const size = req.query.size;
    const sort = req.query.sort;
    if (brand) {
      cateria = {
        $and: [{ collections: collections }, { brand: req.query.brand }],
      };
    }
    if (color) {
      cateria = {
        $and: [{ collections: collections }, { color: req.query.color }],
      };
    }
    if (price) {
      cateria = {
        $and: [{ collections: collections }, { price: req.query.price }],
      };
    }
    if (size) {
      cateria = {
        $and: [{ collections: collections }, { size: req.query.size }],
      };
    }
    if (!collections) {
      cateria = {
        collections: req.query.collections,
      };
    }
    if (sort) {
      bysort = { [`${sort}`]: -1 };
    } else {
      bysort = { createdAt: -1 };
    }
    if (page > totalPage) {
      res.status(404).json("Can't Not Find Page");
    }
    try {
      const products = await Products.find(cateria)
        .sort(bysort)
        .skip((page - 1) * limit)
        .limit(limit);
      res.status(200).json({ products, totalPage });
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async show(req, res, next) {
    const slug = req.params.slug;
    const productDetails = await Products.find({
      slug: slug,
    });
    res.status(200).json(productDetails);
  }
  async store(req, res, next) {
    const name = await Products.findOne({ name: req.body.name });
    if (name) {
      res.status(500).json("Products Already Exist");
    } else {
      const productCode = req.body.productCode;
      const fileUpload = req.files.image;
      const urls = [];
      if (fileUpload.length > 1) {
        for (const files of fileUpload) {
          const file = files;
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "products",
          });
          urls.push({ url: result.url, public_id: result.public_id });
        }
      } else {
        const result = await cloudinary.uploader.upload(
          fileUpload.tempFilePath,
          {
            folder: "products",
          }
        );
        urls.push({ url: result.url, public_id: result.public_id });
      }
      if (!productCode) {
        let randomCode = (Math.random() + 1)
          .toString(36)
          .slice(2, 7)
          .toLocaleUpperCase();
        const product = await new Products({
          image: urls,
          name: req.body.name,
          quantity: req.body.quantity,
          productCode: randomCode,
          collections: req.body.collections,
          category: req.body.category,
          color: req.body.color,
          size: req.body.size,
          importPrice: req.body.importPrice,
          price: req.body.price,
          brand: req.body.brand,
          description: req.body.description,
        });
        await product.save();
        res.status(200).json("Add product success");
      } else {
        const product = await new Products({
          image: urls,
          name: req.body.name,
          quantity: req.body.quantity,
          productCode: productCode,
          collections: req.body.collections,
          category: req.body.category,
          color: req.body.color,
          size: req.body.size,
          importPrice: req.body.importPrice,
          price: req.body.price,
          brand: req.body.brand,
          description: req.body.description,
        });
        await product.save();
        res.status(200).json("Add product success");
      }
    }
  }
  async edit(req, res, next) {
    const products = await Products.findById({ _id: req.params.id });
    try {
      if (products) {
        res.status(200).json(products);
      }
    } catch (error) {
      res.status(500).json("Can't Find Products");
    }
    res.json(products);
  }
  async update(req, res, next) {
    const findId = req.params.id;
    try {
      if (findId) {
        const id = await Products.find({ _id: findId });
        id.map(async (item, index) => {
          const product = await Products.findByIdAndUpdate(
            {
              _id: req.params.id,
            },
            {
              image: item.image,
              name: req.body.name,
              quantity: req.body.quantity,
              productCode: item.productCode,
              collections: req.body.collections,
              category: req.body.category,
              color: req.body.color,
              size: req.body.size,
              importPrice: req.body.importPrice,
              price: req.body.price,
              brand: req.body.brand,
              description: req.body.description,
            }
          );
        });
        res.status(200).json("Update Success");
      } else {
        res.status(400).json("Can not find ID");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async destroy(req, res, next) {
    const id = req.params.id;
    const findId = await Products.findById({ _id: id });
    try {
      if (findId) {
        const product = await Products.findByIdAndDelete({
          _id: id,
        });
        res.status(200).json("Delete Success");
      } else {
        res.status(404).json("Can not find ID");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new ProductsController();
