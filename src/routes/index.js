const AdminCollection = require("./Admin/collections");
const AdminBlogs = require("./Admin/blogs");
const ProducerRouter = require("./Admin/producers");
const AdminProducts = require("./Admin/products");
const ColorRouter = require("./Admin/colors");
const SizeRouter = require("./Admin/sizes");
const UserBlogs = require("./User/blogs");
const UserHome = require("./User/home");
const AuthsRouter = require("./auths");
function route(app) {
  app.use("/", AdminCollection);
  app.use("/", AdminBlogs);
  app.use("/", AdminProducts);
  app.use("/", ProducerRouter);
  app.use("/", AuthsRouter);
  app.use("/", ColorRouter);
  app.use("/", SizeRouter);
  app.use("/", UserBlogs);
  app.use("/", UserHome);
}
module.exports = route;
