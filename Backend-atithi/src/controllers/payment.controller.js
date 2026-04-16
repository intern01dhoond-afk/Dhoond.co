const paymentModel = require("../models/payment.model");

const createPaymentController = async (req, res) => {
  try {
    const {
      order_id,
      amount,
      payment_method,
      payment_status,
      transaction_id,
    } = req.body;

    if (!amount || !payment_method) {
      return res.status(400).json({
        success: false,
        message: "amount and payment_method are required",
      });
    }

    const payment = await paymentModel.createPayment(
      order_id,
      amount,
      payment_method,
      payment_status || "pending",
      transaction_id
    );

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "transaction_id already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPaymentsController = async (req, res) => {
  try {
    const payments = await paymentModel.getPayments();

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPaymentController,
  getPaymentsController,
};