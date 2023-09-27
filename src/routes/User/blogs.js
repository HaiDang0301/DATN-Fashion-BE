const express = require("express");
const blogs = require("../../app/Controllers/User/BlogsController");
const Middleware = require("../../middleware/Middleware");
const router = express.Router();
router.get("/api/blogs", blogs.index);
router.get("/api/blog/:slug", blogs.show);
module.exports = router;
