const express = require("express");
const OrdersController = require("../../app/Controllers/Admin/OrdersController");
const Middleware = require("../../middleware/Middleware");
const router = express.Router();
router.get("/api/admin/orders", Middleware.Admin, OrdersController.index);
router.get("/api/admin/orders/:id", Middleware.Admin, OrdersController.show);
router.put("/api/admin/orders", Middleware.Admin, OrdersController.update);
module.exports = router;
