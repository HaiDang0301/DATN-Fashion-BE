const Products = require("../../Models/ProductsModel");
const Accounts = require("../../Models/AuthsModel");
const WareHouse = require("../../Models/WareHouse");
const Colors = require("../../Models/ColorsModel");
const Collections = require("../../Models/CollectionsModel");
const Producers = require("../../Models/ProducersModel");
const Sizes = require("../../Models/SizesModel");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});
const xlxs = require("xlsx");
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
        bySort = { price: "asc" };
      }
      if (price === "reduce") {
        bySort = { price: "desc" };
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
          const addNew = new WareHouse({
            product_id: product.id,
            price: req.body.importPrice,
            sizes: arrSizes,
            type: 0,
          });
          await addNew.save();
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
          const addNew = new WareHouse({
            product_id: product.id,
            price: req.body.importPrice,
            sizes: arrSizes,
            type: 0,
          });
          await addNew.save();
          res.status(200).json("Add product success");
        }
      }
    }
  }
  async importExcel(req, res, next) {
    const fileExcel = req.files.excel;
    let workbook = xlxs.readFile(fileExcel.tempFilePath);
    let worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let data = xlxs.utils.sheet_to_json(worksheet);
    try {
      await Products.insertMany(data)
        .then(async (products) => {
          data.map(async (item) => {
            const result = await cloudinary.uploader.upload(
              "https://s2s.co.th/wp-content/uploads/2019/09/photo-icon-Copy-7.jpg",
              {
                folder: `collections/${item.collections}/${item.name}`,
              }
            );
            const producers = await Producers.findOneAndUpdate(
              { name: item.producer },
              { $setOnInsert: { name: item.producer } },
              { upsert: true, returnOriginal: false }
            );
            const colors = await Colors.findOneAndUpdate(
              { colors: item.color },
              { $setOnInsert: { colors: item.color } },
              { upsert: true, returnOriginal: false }
            );
            const sizes = await Sizes.findOneAndUpdate(
              { sizes: item.size },
              { $setOnInsert: { sizes: item.size } },
              { upsert: true, returnOriginal: false }
            );
            const collections = await Collections.findOneAndUpdate(
              { collections: item.collections },
              { $setOnInsert: { collections: item.collections } },
              { upsert: true, returnOriginal: false }
            );
            const category = await Collections.findOneAndUpdate(
              {
                collections: item.collections,
                "categories.category": { $ne: item.category },
              },
              {
                $addToSet: {
                  categories: {
                    category: item.category,
                  },
                },
              }
            );
            const addSizes = await Products.findOneAndUpdate(
              {
                name: item.name,
                "sizes.zise": { $ne: item.size },
              },
              {
                $addToSet: {
                  sizes: {
                    size: item.size,
                    quantity: item.quantity,
                  },
                },
              }
            );
            await WareHouse.insertMany([
              {
                product_id: addSizes._id,
                price: item.importPrice,
                sizes: [
                  {
                    size: item.size,
                    quantity: item.quantity,
                  },
                ],
                type: 0,
              },
            ]);
          });
          res.status(200).json("Add Product List Success");
        })
        .catch((err) => {
          res
            .status(409)
            .json("There are duplication products or files not in the format");
        });
    } catch (error) {
      res.status(500).json * "Connect Server False";
    }
  }
  async downloadFile(req, res, next) {
    res.download("./src/public/sampleFile.csv");
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
          let price = "";
          if (promotion) {
            price = req.body.price - req.body.price * (promotion / 100);
            await Accounts.updateMany(
              {
                carts: { $elemMatch: { product_id: id } },
              },
              { $set: { "carts.$.price": price } }
            );
          } else {
            price = req.body.price;
            await Accounts.updateMany(
              {
                carts: { $elemMatch: { product_id: id } },
              },
              { $set: { "carts.$.price": price } }
            );
          }
          const findID = await Products.findOne({ _id: id });
          let arr = findID.sizes;
          if (typeof size === "object") {
            for (let i = 0; i < size.length; i++) {
              arr.unshift({ size: size[i], quantity: quantity[i] });
            }
          } else {
            arr.unshift({ size: size, quantity: quantity });
          }
          const result = {};
          arr.forEach((obj) => {
            const { size, quantity } = obj;
            if (result.hasOwnProperty(size)) {
              result[size] -= quantity;
            } else {
              result[size] = quantity;
            }
          });
          let objsizes = {
            size: Object.keys(result),
            quantity: Object.values(result),
          };
          let sizes = [];
          if (typeof objsizes === "object") {
            for (let i = 0; i < objsizes.size.length; i++) {
              sizes.push({
                size: objsizes.size[i],
                quantity: objsizes.quantity[i],
              });
            }
          } else {
            return sizes.push({
              size: objsizes.size,
              quantity: objsizes.quantity,
            });
          }
          const removeSizeZero = sizes.filter((item) => {
            return item.quantity != 0;
          });
          if (removeSizeZero.length > 0) {
            const addwarehouse = new WareHouse({
              product_id: id,
              price: req.body.importPrice,
              sizes: removeSizeZero,
              type: 0,
            });
            await addwarehouse.save();
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
                  old_price: item.price,
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
                  old_price: item.price,
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
              return res.status(409).json("Products has existed");
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
                  old_price: item.price,
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
                  old_price: item.price,
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
              res.status(409).json("Products has existed");
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
                old_price: item.price,
                promotion: req.body.promotion,
                out_of_promotion: req.body.out_of_promotion,
                description: req.body.description,
                slug: name.split(" ").join("-"),
              }
            );
            try {
              return res.status(200).json("Update Products Sucesss");
            } catch (error) {
              return res.status(409).json("Products has existed");
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
