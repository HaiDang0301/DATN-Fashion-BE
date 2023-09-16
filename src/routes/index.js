const CollectionRouter = require("./collections");
const ProductsRouter = require("./products");
function route(app) {
  app.use("/", CollectionRouter);
  app.use("/", ProductsRouter);
}
module.exports = route;
