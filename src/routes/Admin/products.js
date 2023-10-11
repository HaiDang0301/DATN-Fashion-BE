const express = require("express");
const products = require("../../app/Controllers/Admin/ProductsController");
const Middleware = require("../../middleware/Middleware");
const router = express.Router();
router.get("/api/admin/products", Middleware.Admin, products.index);
router.get(
  "/api/admin/products/download/sampleFile",
  Middleware.Admin,
  products.downloadFile
);
router.post("/api/admin/products", Middleware.Admin, products.store);
router.post(
  "/api/admin/products/importExcel",
  Middleware.Admin,
  products.importExcel
);
router.get("/api/admin/products/:id/edit", Middleware.Admin, products.edit);
router.put("/api/admin/products/:id", Middleware.Admin, products.update);
router.get("/api/admin/products", Middleware.Admin, products.index);
router.delete("/api/admin/products/:id", Middleware.Admin, products.destroy);
module.exports = router;
