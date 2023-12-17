const express = require("express");
const clients = require("../../app/Controllers/Admin/ClientsController");
const Middleware = require("../../middleware/Middleware");
const router = express.Router();
router.get("/api/admin/clients", Middleware.Admin, clients.index);
module.exports = router;
