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
    const product_code = req.query.product_code;
    const collection = req.query.collection;
    const producer = req.query.producer;
    const price = req.query.price;
    const countProducts = await Products.countDocuments();
    var totalPage = Math.ceil(countProducts / limit);
    if (product_code) {
      cateria = { productCode: { $regex: product_code } };
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
      res.status(200).json({ products, totalPage, countProducts });
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
    let dataProduct = {
      name: req.body.name,
      collections: req.body.collections,
      category: req.body.category,
      color: req.body.color,
      importPrice: req.body.importPrice,
      price: req.body.price,
      producer: req.body.producer,
      description: req.body.description,
    };
    if (typeof size === "object") {
      for (let i = 0; i < size.length; i++) {
        arrSizes.push({ size: size[i], quantity: quantity[i] });
      }
    } else {
      arrSizes.push({ size: size, quantity: quantity });
    }
    const findName = await Products.findOne({ name: name });
    if (findName) {
      res.status(409).json("Products has existed");
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
          dataProduct = {
            ...dataProduct,
            image: urls,
            productCode: randomCode,
            sizes: arrSizes,
          };
        } else {
          dataProduct = {
            ...dataProduct,
            image: urls,
            productCode: productCode,
            sizes: arrSizes,
          };
        }
        try {
          const product = new Products(dataProduct);
          await product.save();
          let sumMoney = 0;
          let dataImport = {
            product_id: product.id,
            product_name: name,
            price: req.body.importPrice,
            sizes: arrSizes,
            type: 0,
            totalMoney: sumMoney,
            createdAt: Date.now(),
          };
          let month = new Date().getMonth() + 1;
          if (month === 13) month = "01";
          if (month.length < 2) month = "0" + month;
          arrSizes.forEach((data) => {
            sumMoney += data.quantity * req.body.importPrice;
          });
          const findYear = await WareHouse.findOne({});
          if (!findYear || findYear.years != new Date().getFullYear()) {
            const addwarehouse = new WareHouse({
              years: new Date().getFullYear(),
              months: [
                {
                  month: month,
                  data: dataImport,
                  import_Money: sumMoney,
                },
              ],
            });
            await addwarehouse.save();
          } else {
            const findMonth = await WareHouse.findOne({
              years: new Date().getFullYear(),
              months: { $elemMatch: { month: month } },
            });
            if (findMonth) {
              await WareHouse.findOneAndUpdate(
                {
                  years: new Date().getFullYear(),
                  months: { $elemMatch: { month: month } },
                },
                {
                  $push: {
                    "months.$.data": dataImport,
                  },
                  $inc: {
                    "months.$.import_Money": sumMoney,
                  },
                }
              );
            } else {
              await WareHouse.updateOne(
                {
                  years: new Date().getFullYear(),
                },
                {
                  $addToSet: {
                    months: {
                      month: month,
                      data: dataImport,
                      import_Money: sumMoney,
                    },
                  },
                },
                { upsert: true }
              );
            }
          }
          res.status(200).json("Add product success");
        } catch (error) {
          res.status(500).json("Connect Server Errors");
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
            await cloudinary.uploader.upload(
              "https://s2s.co.th/wp-content/uploads/2019/09/photo-icon-Copy-7.jpg",
              {
                folder: `collections/${item.collections}/${item.name}`,
              }
            );
            await Producers.findOneAndUpdate(
              { name: item.producer },
              { $setOnInsert: { name: item.producer } },
              { upsert: true, returnOriginal: false }
            );
            await Colors.findOneAndUpdate(
              { colors: item.color },
              { $setOnInsert: { colors: item.color } },
              { upsert: true, returnOriginal: false }
            );
            await Sizes.findOneAndUpdate(
              { sizes: item.size },
              { $setOnInsert: { sizes: item.size } },
              { upsert: true, returnOriginal: false }
            );
            await Collections.findOneAndUpdate(
              { collections: item.collections },
              { $setOnInsert: { collections: item.collections } },
              { upsert: true, returnOriginal: false }
            );
            await Collections.findOneAndUpdate(
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
            const product = await Products.findOneAndUpdate(
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
            let sumMoney = item.quantity * product.importPrice;
            let dataImport = {
              product_id: product.id,
              product_name: product.name,
              price: product.importPrice,
              sizes: {
                size: item.size,
                quantity: item.quantity,
              },
              type: 0,
              totalMoney: sumMoney,
              createdAt: Date.now(),
            };
            let month = new Date().getMonth() + 1;
            if (month === 13) month = "01";
            if (month.length < 2) month = "0" + month;
            const findYear = await WareHouse.findOne({});
            if (!findYear || findYear.years != new Date().getFullYear()) {
              const addwarehouse = new WareHouse({
                years: new Date().getFullYear(),
                months: [
                  {
                    month: month,
                    data: dataImport,
                    import_Money: sumMoney,
                  },
                ],
              });
              await addwarehouse.save();
            } else {
              const findMonth = await WareHouse.findOne({
                years: new Date().getFullYear(),
                months: { $elemMatch: { month: month } },
              });
              if (findMonth) {
                await WareHouse.findOneAndUpdate(
                  {
                    years: new Date().getFullYear(),
                    months: { $elemMatch: { month: month } },
                  },
                  {
                    $push: {
                      "months.$.data": dataImport,
                    },
                    $inc: {
                      "months.$.import_Money": sumMoney,
                    },
                  }
                );
              } else {
                await WareHouse.updateOne(
                  {
                    years: new Date().getFullYear(),
                  },
                  {
                    $addToSet: {
                      months: {
                        month: month,
                        data: dataImport,
                        import_Money: sumMoney,
                      },
                    },
                  },
                  { upsert: true }
                );
              }
            }
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
    const name = req.body.name;
    const producer = req.body.producer;
    const collections = req.body.collections;
    const category = req.body.category;
    const size = req.body.size;
    const quantity = req.body.quantity;
    const importPrice = req.body.importPrice;
    const color = req.body.color;
    const arrSizes = [];
    const urls = [];
    const fileUpload = req.files;
    const promotion = req.body.promotion;
    const out_of_promotion = req.body.out_of_promotion;
    const description = req.body.description;
    let price = 0;
    let sumMoney = 0;
    let dataProducts = {
      name: name,
      collections: collections,
      promotion: promotion,
      out_of_promotion: out_of_promotion,
      category: category,
      color: color,
      importPrice: importPrice,
      producer: producer,
      description: description,
    };
    if (typeof size === "object") {
      for (let i = 0; i < size.length; i++) {
        arrSizes.push({ size: size[i], quantity: quantity[i] });
      }
    } else {
      arrSizes.push({ size: size, quantity: quantity });
    }
    if (promotion) {
      price = req.body.price - req.body.price * (promotion / 100);
    } else {
      price = req.body.price;
    }
    const product = await Products.findOne({ _id: id });
    if (!product) {
      res.status(404).json("Can not find ID");
    } else {
      if (name !== product.name && !fileUpload) {
        return res.status(403).json("Please provide image");
      }
      if (name !== product.name && fileUpload) {
        if (fileUpload.image.length > 1) {
          await cloudinary.api.delete_resources_by_prefix(
            `collections/${product.collections}/${product.name}`
          );
          await cloudinary.api.delete_folder(
            `collections/${product.collections}/${product.name}`
          );
          for (const files of fileUpload.image) {
            const file = files;
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
              folder: `collections/${collection}/${name}`,
            });
            urls.push({ url: result.url, public_id: result.public_id });
          }
          dataProducts = {
            ...dataProducts,
            image: urls,
            sizes: arrSizes,
            price: price,
            old_price: product.price,
            slug: name.split(" ").join("-"),
          };
        } else {
          await cloudinary.api.delete_resources_by_prefix(
            `collections/${product.collections}/${item.name}`
          );
          await cloudinary.api.delete_folder(
            `collections/${product.collections}/${item.name}`
          );
          const result = await cloudinary.uploader.upload(
            fileUpload.image.tempFilePath,
            {
              folder: `collections/${collection}/${name}`,
            }
          );
          urls.push({ url: result.url, public_id: result.public_id });
          dataProducts = {
            ...dataProducts,
            image: urls,
            sizes: arrSizes,
            price: price,
            old_price: product.price,
            slug: name.split(" ").join("-"),
          };
        }
      }
      if (name === product.name && fileUpload) {
        if (fileUpload.image.length > 1) {
          await cloudinary.api.delete_resources_by_prefix(
            `collections/${product.collections}/${product.name}`
          );
          await cloudinary.api.delete_folder(
            `collections/${product.collections}/${product.name}`
          );
          for (const files of fileUpload.image) {
            const file = files;
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
              folder: `collections/${collection}/${name}`,
            });
            urls.push({ url: result.url, public_id: result.public_id });
          }
          dataProducts = {
            image: urls,
            sizes: arrSizes,
            price: price,
            old_price: product.price,
            slug: name.split(" ").join("-"),
          };
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
          dataProducts = {
            image: urls,
            sizes: arrSizes,
            price: price,
            old_price: product.price,
            slug: name.split(" ").join("-"),
          };
        }
      } else {
        dataProducts = {
          ...dataProducts,
          sizes: arrSizes,
          price: price,
          old_price: product.price,
          slug: name.split(" ").join("-"),
        };
      }
    }
    try {
      await Accounts.updateMany(
        {
          carts: { $elemMatch: { product_id: id } },
        },
        { $set: { "carts.$.price": price } }
      );
      //Find size & quantity Product
      const findID = await Products.findOne({ _id: id });
      let arr = findID.sizes;
      if (typeof size === "object") {
        for (let i = 0; i < size.length; i++) {
          arr.unshift({ size: size[i], quantity: quantity[i] });
        }
      } else {
        arr.unshift({ size: size, quantity: quantity });
      }
      //Change quantity Product
      const result = {};
      arr.forEach((obj) => {
        const { size, quantity } = obj;
        if (result.hasOwnProperty(size)) {
          result[size] -= quantity;
        } else {
          result[size] = quantity;
        }
      });
      //Get Key & Value
      let objsizes = {
        size: Object.keys(result),
        quantity: Object.values(result),
      };
      //Push key & value to array
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
      //removeSizeZero
      const removeSizeZero = sizes.filter((item) => {
        return item.quantity != 0;
      });
      removeSizeZero.forEach((data) => {
        sumMoney += data.quantity * importPrice;
      });
      if (removeSizeZero.length > 0) {
        let dataImport = {
          product_id: id,
          product_name: name,
          price: req.body.importPrice,
          sizes: removeSizeZero,
          type: 0,
          totalMoney: sumMoney,
          createdAt: Date.now(),
        };
        let month = new Date().getMonth() + 1;
        if (month === 13) month = "01";
        if (month.length < 2) month = "0" + month;
        const findYear = await WareHouse.findOne({});
        if (!findYear || findYear.years != new Date().getFullYear()) {
          const addwarehouse = new WareHouse({
            years: new Date().getFullYear(),
            months: [
              {
                month: month,
                data: dataImport,
                import_Money: sumMoney,
              },
            ],
          });
          await addwarehouse.save();
        } else {
          const findMonth = await WareHouse.findOne({
            years: new Date().getFullYear(),
            months: { $elemMatch: { month: month } },
          });
          if (findMonth) {
            await WareHouse.findOneAndUpdate(
              {
                years: new Date().getFullYear(),
                months: { $elemMatch: { month: month } },
              },
              {
                $push: {
                  "months.$.data": dataImport,
                },
                $inc: {
                  "months.$.import_Money": sumMoney,
                },
              }
            );
          } else {
            await WareHouse.updateOne(
              {
                years: new Date().getFullYear(),
              },
              {
                $addToSet: {
                  months: {
                    month: month,
                    data: dataImport,
                    import_Money: sumMoney,
                  },
                },
              },
              { upsert: true }
            );
          }
        }
      }
      await Products.findByIdAndUpdate({ _id: id }, dataProducts);
      res.status(200).json("Update Products Sucesss");
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
