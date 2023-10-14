const express = require("express");
const products = require("../../app/Controllers/User/ProductsController");
const router = express.Router();
router.get("/api/products/collections/:type?/:category?", products.index);
module.exports = router;
