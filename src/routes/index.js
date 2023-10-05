const AdminCollection = require("./Admin/collections");
const AdminBlogs = require("./Admin/blogs");
const ProducerRouter = require("./Admin/producers");
const ColorRouter = require("./Admin/colors");
const SizeRouter = require("./Admin/sizes");
const UserBlogs = require("./User/blogs");
const AuthsRouter = require("./auths");
function route(app) {
  app.use("/", AdminCollection);
  app.use("/", AdminBlogs);
  app.use("/", ProducerRouter);
  app.use("/", UserBlogs);
  app.use("/", AuthsRouter);
  app.use("/", ColorRouter);
  app.use("/", SizeRouter);
}
module.exports = route;
