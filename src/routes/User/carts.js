const express = require("express");
const CartsController = require("../../app/Controllers/User/CartsController");
const Middleware = require("../../middleware/Middleware");
const router = express.Router();
router.get("/api/user/carts", Middleware.User, CartsController.index);
router.post("/api/user/carts", Middleware.User, CartsController.store);
router.delete("/api/user/carts", Middleware.User, CartsController.destroy);
module.exports = router;
