const express = require("express");
const SizeController = require("../../app/Controllers/Admin/SizesController");
const Middleware = require("../../middleware/Middleware");
const router = express.Router();
router.get("/api/admin/sizes", Middleware.Admin, SizeController.index);
router.post("/api/admin/sizes", Middleware.Admin, SizeController.store);
router.put("/api/admin/sizes/:id", Middleware.Admin, SizeController.update);
router.delete("/api/admin/sizes/:id", Middleware.Admin, SizeController.destroy);
module.exports = router;
