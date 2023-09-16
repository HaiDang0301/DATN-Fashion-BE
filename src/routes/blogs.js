const blogs = require("../app/Controllers/BlogsController");
const express = require("express");
const router = express.Router();
router.get("/blogs", blogs.index);
module.exports = router;
