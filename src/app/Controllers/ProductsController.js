const Product = require("../Models/ProductsModel");
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
    const countProducts = await Product.countDocuments();
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
      const products = await Product.find(cateria);
      res.json(products);
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
      const products = await Product.find(cateria)
        .sort(bysort)
        .skip((page - 1) * limit)
        .limit(limit);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async show(req, res, next) {
    const slug = req.params.slug;
    const productDetails = await Product.find({
      slug: slug,
    });
    res.status(200).json(productDetails);
  }
  async store(req, res, next) {
    const name = await Product.findOne({ name: req.body.name });
    if (name) {
      res.status(500).json("Products Already Exist");
    } else {
      const productCode = req.body.productCode;
      let randomCode = (Math.random() + 1)
        .toString(36)
        .slice(2, 7)
        .toLocaleUpperCase();
      const fileUpload = req.files.image;
      const result = await cloudinary.uploader.upload(fileUpload.tempFilePath);
      if (productCode === "") {
        const product = await new Product({
          image: result.url,
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
        const product = await new Product({
          image: result.url,
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
  async update(req, res, next) {
    const id = req.params.id;
    const findId = await Product.findById({ _id: id });
    try {
      if (findId) {
        const product = await Product.findByIdAndUpdate(
          {
            _id: id,
          },
          {
            image: req.body.image,
            name: req.body.name,
            quantity: req.body.quantity,
            productCode: req.body.productCode,
            unit: req.body.unit,
            category: req.body.category,
            color: req.body.color,
            size: req.body.size,
            importPrice: req.body.importPrice,
            price: req.body.price,
            brand: req.body.brand,
            description: req.body.description,
          }
        );
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
    const findId = await Product.findById({ _id: id });
    try {
      if (findId) {
        const product = await Product.findByIdAndDelete({
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
