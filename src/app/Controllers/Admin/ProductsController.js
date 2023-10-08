const Products = require("../../Models/ProductsModel");
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
    const limit = 9;
    let bySort = { createdAt: "desc" };
    const page = req.query.page;
    const name = req.query.name;
    const collection = req.query.collection;
    const producer = req.query.producer;
    const price = req.query.price;
    const countProducts = await Products.countDocuments();
    var totalPage = Math.ceil(countProducts / limit);
    if (name) {
      cateria = { name: { $regex: name } };
      const countProducts = await Products.find(cateria).countDocuments();
      totalPage = Math.ceil(countProducts / limit);
    }
    if (collection) {
      cateria = { collections: collection };
      const countProducts = await Products.find(cateria).countDocuments();
      totalPage = Math.ceil(countProducts / limit);
    }
    if (producer) {
      cateria = { producer: producer };
      const countProducts = await Products.find(cateria).countDocuments();
      totalPage = Math.ceil(countProducts / limit);
    }
    if (price) {
      if (price === "increase") {
        bySort = { price: "desc" };
      }
      if (price === "reduce") {
        bySort = { price: "asc" };
      }
    }
    if (page > totalPage) {
      res.status(404).json("Can't Not Find Page");
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
  async store(req, res, next) {
    const name = req.body.name;
    const collections = req.body.collections;
    const size = req.body.size;
    const quantity = req.body.quantity;
    const arrSizes = [];
    if (typeof size === "object") {
      for (let i = 0; i < size.length; i++) {
        arrSizes.push({ size: size[i], quantity: quantity[i] });
      }
    } else {
      arrSizes.push({ size: size, quantity: quantity });
    }
    const findName = await Products.findOne({ name: name });
    if (findName) {
      res.status(500).json("Products Already Exist");
    } else {
      const urls = [];
      const productCode = req.body.productCode;
      const fileUpload = req.files;
      if (!fileUpload) {
        return res.status(403).json("Please provide image");
      } else {
        if (fileUpload.image.length > 1) {
          for (const files of fileUpload.image) {
            const file = files;
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
              folder: `collections/${collections}/${name}`,
            });
            urls.push({ url: result.url, public_id: result.public_id });
          }
        } else {
          const result = await cloudinary.uploader.upload(
            fileUpload.image.tempFilePath,
            {
              folder: `collections/${collections}/${name}`,
            }
          );
          urls.push({ url: result.url, public_id: result.public_id });
        }
        if (!productCode) {
          let randomCode = (Math.random() + 1)
            .toString(36)
            .slice(2, 7)
            .toLocaleUpperCase();
          const product = new Products({
            image: urls,
            name: req.body.name,
            productCode: randomCode,
            collections: req.body.collections,
            category: req.body.category,
            color: req.body.color,
            sizes: arrSizes,
            importPrice: req.body.importPrice,
            price: req.body.price,
            producer: req.body.producer,
            description: req.body.description,
          });
          await product.save();
          res.status(200).json("Add product success");
        } else {
          const product = new Products({
            image: urls,
            name: req.body.name,
            productCode: productCode,
            collections: req.body.collections,
            category: req.body.category,
            color: req.body.color,
            sizes: arrSizes,
            importPrice: req.body.importPrice,
            price: req.body.price,
            producer: req.body.producer,
            description: req.body.description,
          });
          await product.save();
          res.status(200).json("Add product success");
        }
      }
    }
  }
  async edit(req, res, next) {
    const products = await Products.findOne({ _id: req.params.id });
    try {
      if (products) {
        res.status(200).json(products);
      } else {
        res.status(404).json("Can't Find Products");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async update(req, res, next) {
    const collection = req.body.collections;
    const id = req.params.id;
    const size = req.body.size;
    const quantity = req.body.quantity;
    const arrSizes = [];
    if (typeof size === "object") {
      for (let i = 0; i < size.length; i++) {
        arrSizes.push({ size: size[i], quantity: quantity[i] });
      }
    } else {
      arrSizes.push({ size: size, quantity: quantity });
    }
    try {
      const product = await Products.find({ _id: id });
      const name = req.body.name;
      if (product) {
        product.map(async (item) => {
          const fileUpload = req.files;
          const promotion = req.body.promotion;
          let price = 0;
          if (promotion) {
            price = item.price - item.price * (promotion / 100);
          } else {
            price = item.price;
          }
          const urls = [];
          if (name !== item.name && !fileUpload) {
            return res.status(403).json("Please provide image");
          }
          if (name !== item.name && fileUpload) {
            if (fileUpload.image.length > 1) {
              await cloudinary.api.delete_resources_by_prefix(
                `collections/${item.collections}/${item.name}`
              );
              await cloudinary.api.delete_folder(
                `collections/${item.collections}/${item.name}`
              );
              for (const files of fileUpload.image) {
                const file = files;
                const result = await cloudinary.uploader.upload(
                  file.tempFilePath,
                  {
                    folder: `collections/${collection}/${name}`,
                  }
                );
                urls.push({ url: result.url, public_id: result.public_id });
              }
              await Products.findByIdAndUpdate(
                { _id: id },
                {
                  image: urls,
                  name: req.body.name,
                  productCode: item.productCode,
                  collections: req.body.collections,
                  promotion: req.body.promotion,
                  out_of_promotion: req.body.out_of_promotion,
                  category: req.body.category,
                  color: req.body.color,
                  sizes: arrSizes,
                  importPrice: req.body.importPrice,
                  price: price,
                  producer: req.body.producer,
                  description: req.body.description,
                  slug: name.split(" ").join("-"),
                }
              );
            } else {
              await cloudinary.api.delete_resources_by_prefix(
                `collections/${item.collections}/${item.name}`
              );
              await cloudinary.api.delete_folder(
                `collections/${item.collections}/${item.name}`
              );
              const result = await cloudinary.uploader.upload(
                fileUpload.image.tempFilePath,
                {
                  folder: `collections/${collection}/${name}`,
                }
              );
              urls.push({ url: result.url, public_id: result.public_id });
              await Products.findByIdAndUpdate(
                { _id: id },
                {
                  image: urls,
                  name: req.body.name,
                  producer: req.body.producer,
                  productCode: item.productCode,
                  collections: req.body.collections,
                  category: req.body.category,
                  color: req.body.color,
                  sizes: arrSizes,
                  importPrice: req.body.importPrice,
                  price: price,
                  promotion: req.body.promotion,
                  out_of_promotion: req.body.out_of_promotion,
                  description: req.body.description,
                  slug: name.split(" ").join("-"),
                }
              );
            }
            try {
              return res.status(200).json("Update Products Sucesss");
            } catch (error) {
              return res.status(403).json("Products has existed");
            }
          }
          if (name === item.name && fileUpload) {
            if (fileUpload.image.length > 1) {
              await cloudinary.api.delete_resources_by_prefix(
                `collections/${item.collections}/${item.name}`
              );
              await cloudinary.api.delete_folder(
                `collections/${item.collections}/${item.name}`
              );
              for (const files of fileUpload.image) {
                const file = files;
                const result = await cloudinary.uploader.upload(
                  file.tempFilePath,
                  {
                    folder: `collections/${collection}/${name}`,
                  }
                );
                urls.push({ url: result.url, public_id: result.public_id });
              }
              await Products.findByIdAndUpdate(
                { _id: id },
                {
                  image: urls,
                  name: req.body.name,
                  productCode: item.productCode,
                  collections: req.body.collections,
                  promotion: req.body.promotion,
                  out_of_promotion: req.body.out_of_promotion,
                  category: req.body.category,
                  color: req.body.color,
                  sizes: arrSizes,
                  importPrice: req.body.importPrice,
                  price: price,
                  producer: req.body.producer,
                  description: req.body.description,
                  slug: name.split(" ").join("-"),
                }
              );
            } else {
              await cloudinary.api.delete_resources_by_prefix(
                `collections/${item.collections}/${item.name}`
              );
              await cloudinary.api.delete_folder(
                `collections/${item.collections}/${item.name}`
              );
              const result = await cloudinary.uploader.upload(
                fileUpload.image.tempFilePath,
                {
                  folder: `collections/${collection}/${name}`,
                }
              );
              urls.push({ url: result.url, public_id: result.public_id });
              await Products.findByIdAndUpdate(
                { _id: id },
                {
                  image: urls,
                  name: req.body.name,
                  producer: req.body.producer,
                  productCode: item.productCode,
                  collections: req.body.collections,
                  category: req.body.category,
                  color: req.body.color,
                  sizes: arrSizes,
                  importPrice: req.body.importPrice,
                  price: price,
                  promotion: req.body.promotion,
                  out_of_promotion: req.body.out_of_promotion,
                  description: req.body.description,
                  slug: name.split(" ").join("-"),
                }
              );
            }
            try {
              res.status(200).json("Update Products Sucesss");
            } catch (error) {
              res.status(403).json("Products has existed");
            }
          } else {
            await Products.findByIdAndUpdate(
              { _id: id },
              {
                image: item.image,
                name: req.body.name,
                productCode: item.productCode,
                collections: req.body.collections,
                promotion: req.body.promotion,
                producer: req.body.producer,
                category: req.body.category,
                color: req.body.color,
                sizes: arrSizes,
                importPrice: req.body.importPrice,
                price: price,
                promotion: req.body.promotion,
                out_of_promotion: req.body.out_of_promotion,
                description: req.body.description,
                slug: name.split(" ").join("-"),
              }
            );
            try {
              return res.status(200).json("Update Products Sucesss");
            } catch (error) {
              return res.status(403).json("Products has existed");
            }
          }
        });
      } else {
        return res.status(404).json("Can not find ID");
      }
    } catch (error) {
      return res.status(500).json("Connect Server False");
    }
  }
  async destroy(req, res, next) {
    const id = req.params.id;
    const findId = await Products.findById({ _id: id });
    const collection = findId.collections;
    const name = findId.name;
    try {
      if (findId) {
        const product = await Products.findByIdAndDelete({
          _id: id,
        })
          .then(async () => {
            await cloudinary.api.delete_resources_by_prefix(
              `collections/${collection}/${name}`
            );
            await cloudinary.api.delete_folder(
              `collections/${collection}/${name}`
            );
            res.status(200).json("Delete Success");
          })
          .catch((err) => {
            res.status(500).json(err);
          });
      } else {
        res.status(404).json("Can not find ID");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new ProductsController();
