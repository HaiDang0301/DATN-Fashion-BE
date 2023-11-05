const express = require("express");
const StatisticalController = require("../../app/Controllers/Admin/StatisticalController");
const Middleware = require("../../middleware/Middleware");
const router = express.Router();
router.get(
  "/api/admin/statistical",
  Middleware.Admin,
  StatisticalController.index
);
router.get(
  "/api/admin/statistical/date",
  Middleware.Admin,
  StatisticalController.getDate
);
module.exports = router;
