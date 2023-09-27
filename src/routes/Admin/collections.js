const express = require("express");
const collections = require("../../app/Controllers/Admin/CollectionsController");
const Middleware = require("../../middleware/Middleware");
const router = express.Router();
router.get(
  "/api/admin/collections/:category?",
  Middleware.Admin,
  collections.show
);
router.post("/api/admin/collections", Middleware.Admin, collections.store);
router.put("/api/admin/collections/:id", Middleware.Admin, collections.update);
router.delete(
  "/api/admin/collections/:id",
  Middleware.Admin,
  collections.destroy
);
module.exports = router;
