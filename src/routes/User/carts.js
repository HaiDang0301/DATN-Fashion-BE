const express = require("express");
const CartsController = require("../../app/Controllers/User/CartsController");
const Middleware = require("../../middleware/Middleware");
const router = express.Router();
router.get("/api/user/carts", Middleware.User, CartsController.index);
router.post("/api/user/carts", Middleware.User, CartsController.store);
router.delete("/api/user/carts/:id", Middleware.User, CartsController.destroy);
router.post("/api/user/carts/orders", Middleware.User, CartsController.orders);
router.post(
  "/api/user/carts/orders/payment",
  Middleware.User,
  CartsController.payment
);
module.exports = router;
