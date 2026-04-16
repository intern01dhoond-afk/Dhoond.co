const express = require("express");
const router = express.Router();
const { getStatsController } = require("../controllers/admin.controller");

router.get("/stats", getStatsController);

module.exports = router;
