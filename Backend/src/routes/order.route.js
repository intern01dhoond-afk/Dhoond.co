const express = require("express");
const router = express.Router();

const {
  createOrderController,
  getOrdersController,
  updateOrderController,
  getSyncDetailsController,
  getBookedSlotsController,
} = require("../controllers/order.controller");

router.post("/create", createOrderController);
router.post("/update", updateOrderController);
router.get("/all", getOrdersController);
router.get("/sync/:key", getSyncDetailsController);
router.get("/booked-slots", getBookedSlotsController);

module.exports = router;