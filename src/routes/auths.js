const express = require("express");
const auths = require("../app/Controllers/AuthsController");
const Middleware = require("../middleware/Middleware");
const router = express.Router();
router.post("/api/auth/register", auths.register);
router.post("/api/auth/login", auths.login);
router.post("/api/auth/forget-password", auths.forget);
router.post("/api/auth/reset-password/:token", auths.reset);
module.exports = router;
