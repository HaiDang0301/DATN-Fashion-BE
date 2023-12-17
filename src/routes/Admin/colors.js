const express = require("express");
const ColorsController = require("../../app/Controllers/Admin/ColorsController");
const Middleware = require("../../middleware/Middleware");
const router = express.Router();
router.get("/api/admin/colors", Middleware.Admin, ColorsController.index);
router.post("/api/admin/colors", Middleware.Admin, ColorsController.store);
router.put("/api/admin/colors/:id", Middleware.Admin, ColorsController.update);
router.delete(
  "/api/admin/colors/:id",
  Middleware.Admin,
  ColorsController.destroy
);
module.exports = router;
