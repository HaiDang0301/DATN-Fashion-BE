const CollectionRouter = require("./collections");
const ProductsRouter = require("./products");
const BlogsRouter = require("./blogs");
function route(app) {
  app.use("/", CollectionRouter);
  app.use("/", ProductsRouter);
  app.use("/", BlogsRouter);
}
module.exports = route;
