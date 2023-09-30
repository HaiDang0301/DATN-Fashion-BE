const express = require("express");
const producer = require("../../app/Controllers/Admin/ProducerController");
const router = express.Router();
router.get("/api/admin/producers", producer.index);
router.post("/api/admin/producers", producer.store);
router.get("/api/admin/producers/:id/edit", producer.edit);
router.put("/api/admin/producers/:id", producer.update);
router.delete("/api/admin/producers/:id", producer.destroy);
module.exports = router;
