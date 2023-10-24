const Carts = require("../../Models/CartsModel");
const Products = require("../../Models/ProductsModel");
class CartsController {
  async index(req, res, next) {
    const id = req.user.id;
    try {
      const cart = await Carts.findOne({ user_id: id });
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
            const user_id = await Carts.findOne({ user_id: id });
            if (!user_id) {
              const carts = new Carts({
                user_id: id,
                carts: {
                  product_id: product_id,
                  product_name: product_name,
                  image: image,
                  size: size,
                  quantity: quantity,
                  price: price,
                },
              });
              carts.save();
              return res
                .status(200)
                .json("Add products to successful shopping cart");
            } else {
              const findProduct = await Carts.find({
                user_id: id,
                carts: { $elemMatch: { product_id: product_id, size: size } },
              });
              if (findProduct.length > 0) {
                res.status(409).json("Products already in the cart");
              } else {
                await Carts.findOneAndUpdate(
                  { user_id: id },
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
  async update(req, res, next) {}
}
module.exports = new CartsController();
