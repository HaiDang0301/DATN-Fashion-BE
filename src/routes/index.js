const CollectionRouter = require("./collections");
function route(app) {
  app.use("/", CollectionRouter);
}
module.exports = route;
