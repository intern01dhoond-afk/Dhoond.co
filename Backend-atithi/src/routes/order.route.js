const express = require("express");
const router = express.Router();

const {
  createOrderController,
  getOrdersController,
} = require("../controllers/order.controller");

router.post("/create", createOrderController);
router.get("/all", getOrdersController);

module.exports = router;