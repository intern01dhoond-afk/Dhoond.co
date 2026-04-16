const express = require("express");
const router = express.Router();

const {
  createPaymentController,
  getPaymentsController,
} = require("../controllers/payment.controller");

router.post("/create", createPaymentController);
router.get("/all", getPaymentsController);

module.exports = router;