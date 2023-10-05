const AdminCollection = require("./Admin/collections");
const AdminBlogs = require("./Admin/blogs");
const ProducerRouter = require("./Admin/producers");
const ColorRouter = require("./Admin/colors");
const UserBlogs = require("./User/blogs");
const AuthsRouter = require("./auths");
function route(app) {
  app.use("/", AdminCollection);
  app.use("/", AdminBlogs);
  app.use("/", ProducerRouter);
  app.use("/", UserBlogs);
  app.use("/", AuthsRouter);
  app.use("/", ColorRouter);
}
module.exports = route;
