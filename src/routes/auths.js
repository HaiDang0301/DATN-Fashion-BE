const express = require("express");
const auths = require("../app/Controllers/AuthsController");
const Middleware = require("../middleware/Middleware");
const router = express.Router();
router.post("/api/auth/register", auths.register);
router.post("/api/auth/login", auths.login);
module.exports = router;
