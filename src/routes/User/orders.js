const express = require("express");
const OrdersController = require("../../app/Controllers/User/OrdersController");
const Middleware = require("../../middleware/Middleware");
const router = express.Router();
router.get("/api/user/carts/orders", Middleware.User, OrdersController.index);
router.get(
  "/api/user/carts/orders/:id",
  Middleware.User,
  OrdersController.show
);
module.exports = router;
