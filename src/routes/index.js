const AuthsRouter = require("./auths");
const AdminStatistical = require("./Admin/statistical");
const AdminCollection = require("./Admin/collections");
const AdminBlogs = require("./Admin/blogs");
const AdminOrders = require("./Admin/orders");
const AdminClients = require("./Admin/clients");
const ProducerRouter = require("./Admin/producers");
const AdminProducts = require("./Admin/products");
const ColorRouter = require("./Admin/colors");
const SizeRouter = require("./Admin/sizes");
const BannerRouter = require("./Admin/banners");
const UserBlogs = require("./User/blogs");
const UserHome = require("./User/home");
const userProduct = require("./User/products");
const CartsUser = require("./User/carts");
const OrdersUser = require("./User/orders");
function route(app) {
  app.use("/", AdminCollection);
  app.use("/", AdminBlogs);
  app.use("/", AdminStatistical);
  app.use("/", AdminOrders);
  app.use("/", AdminProducts);
  app.use("/", AdminClients);
  app.use("/", ProducerRouter);
  app.use("/", AuthsRouter);
  app.use("/", ColorRouter);
  app.use("/", SizeRouter);
  app.use("/", BannerRouter);
  app.use("/", UserBlogs);
  app.use("/", UserHome);
  app.use("/", userProduct);
  app.use("/", CartsUser);
  app.use("/", OrdersUser);
}
module.exports = route;
