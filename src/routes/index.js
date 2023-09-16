const CollectionRouter = require("./collections");
const BlogsRouter = require("./blogs");
function route(app) {
  app.use("/", CollectionRouter);
  app.use("/", BlogsRouter);
}
module.exports = route;
