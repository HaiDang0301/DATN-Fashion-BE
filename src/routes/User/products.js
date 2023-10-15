const express = require("express");
const products = require("../../app/Controllers/User/ProductsController");
const router = express.Router();
router.get("/api/collections/products/:slug", products.show);
router.get("/api/collections/:type?/:category?", products.index);

module.exports = router;
