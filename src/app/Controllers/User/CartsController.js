const Accounts = require("../../Models/AuthsModel");
const Products = require("../../Models/ProductsModel");
const Orders = require("../../Models/OrdersModel");
class CartsController {
  async index(req, res, next) {
    const id = req.user.id;
    try {
      const cart = await Accounts.findOne({ _id: id });
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json("Connect Server Errors");
    }
  }
  async store(req, res, next) {
    const id = req.user.id;
    const product_id = req.body.product_id;
    const product_name = req.body.product_name;
    const image = req.body.image;
    const size = req.body.size;
    const quantity = req.body.quantity;
    const price = req.body.price;
    if (!product_id && product_name && size && quantity && price) {
      return res.status(409).json("Please provide full information");
    }
    try {
      const findProduct = await Products.findOne({ _id: product_id });
      if (!findProduct) {
        return res.status(404).json("Can't Find Product");
      } else {
        const findSize = findProduct.sizes.filter((item) => {
          return item.size === size;
        });
        findSize.map(async (product) => {
          if (quantity <= product.quantity) {
            const user_id = await Accounts.findOne({ _id: id });
            if (user_id) {
              const findProduct = await Accounts.find({
                _id: id,
                carts: { $elemMatch: { product_id: product_id, size: size } },
              });
              if (findProduct.length > 0) {
                res.status(409).json("Products already in the cart");
              } else {
                await Accounts.findOneAndUpdate(
                  { _id: id },
                  {
                    user_id: id,
                    $push: {
                      carts: {
                        product_id: product_id,
                        product_name: product_name,
                        image: image,
                        size: size,
                        quantity: quantity,
                        price: price,
                      },
                    },
                  }
                );
                return res
                  .status(200)
                  .json("Add products to successful shopping cart");
              }
            }
          } else {
            return res.status(403).json({
              quantity: product.quantity,
              massage: "The number of products in the warehouse is not enough",
            });
          }
        });
      }
    } catch (error) {
      return res.status(500).json("Connect Server Errors");
    }
  }
  async destroy(req, res, next) {
    const user_id = req.user.id;
    const product_id = req.params.id;
    try {
      await Accounts.findOneAndUpdate(
        {
          _id: user_id,
          carts: { $elemMatch: { product_id: product_id } },
        },
        { $pull: { carts: { product_id: product_id } } }
      );
      res.status(200).json("Delete products from successful carts");
    } catch (error) {
      res.status(500).json("Connect Server Errors");
    }
  }
  async orders(req, res, next) {
    const id = req.user.id;
    const full_name = req.body.full_name;
    const email = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;
    const carts = req.body.carts;
    const totalMoney = Number(req.body.totalMoney).toLocaleString();
    let randomCode = (Math.random() + 1)
      .toString(36)
      .slice(2, 8)
      .toLocaleUpperCase();
    try {
      if (!full_name || !email || !phone || carts.length === 0) {
        res.status(403).json("Please provide full information");
      } else {
        const orders = new Orders({
          orders_code: randomCode,
          user_id: id,
          phone: phone,
          full_name: full_name,
          orders: carts,
          totalMoney: totalMoney,
          address: address,
        });
        await orders.save();
        await Accounts.findOneAndUpdate(
          {
            _id: id,
          },
          { carts: [] }
        );
        res
          .status(200)
          .json(
            "Successful order, please wait for the admin to confirm your order"
          );
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new CartsController();
