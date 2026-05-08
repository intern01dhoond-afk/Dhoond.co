const express = require("express");
const router = express.Router();

const {
  createOrderController,
  getOrdersController,
  updateOrderController,
} = require("../controllers/order.controller");

router.post("/create", createOrderController);
router.post("/update", updateOrderController);
router.get("/all", getOrdersController);

module.exports = router;