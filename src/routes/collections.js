const express = require("express");
const collections = require("../app/Controllers/CollectionsController");
const router = express.Router();
router.get("/collections/:category?", collections.show);
router.post("/collections", collections.store);
router.put("/collections/:id", collections.update);
router.delete("/collections/:id", collections.destroy);
module.exports = router;
