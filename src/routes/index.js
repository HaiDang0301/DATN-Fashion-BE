const CollectionRouter = require("./collections");
const BlogRouter = require("./blogs");
function route(app) {
  app.use("/", CollectionRouter);
  app.use("/", BlogRouter);
}
module.exports = route;
