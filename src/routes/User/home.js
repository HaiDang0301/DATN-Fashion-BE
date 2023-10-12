const express = require("express");
const home = require("../../app/Controllers/User/HomeController");
const router = express.Router();
router.get("/api/user/home/newProduct", home.index);
router.get("/api/user/home/showCollection", home.collectionShow);
router.get("/api/user/home/products/special", home.sale);
module.exports = router;
