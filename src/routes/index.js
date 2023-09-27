const AdminCollection = require("./Admin/collections");
const AdminBlogs = require("./Admin/blogs");
const UserBlogs = require("./User/blogs");
const AuthsRouter = require("./auths");
function route(app) {
  app.use("/", AdminCollection);
  app.use("/", AdminBlogs);
  app.use("/", UserBlogs);
  app.use("/", AuthsRouter);
}
module.exports = route;
