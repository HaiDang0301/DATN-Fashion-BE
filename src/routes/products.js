const express = require("express");
const products = require("../app/Controllers/ProductsController");
const router = express.Router();
router.get("/products/:category?", products.show);
router.post("/products", products.store);
router.put("/products/:id", products.update);
router.delete("/products/:id", products.destroy);
module.exports = router;
