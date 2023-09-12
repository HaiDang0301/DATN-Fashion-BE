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
  async show(req, res, next) {
    const categories = req.body.categories;
    const product = await Product.find({ category: categories });
    res.send(product);
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
          saleProduct: req.body.saleProduct,
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
          saleProduct: req.body.saleProduct,
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
            saleProduct: req.body.price,
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
