const orderModel = require("../models/order.model");

const createOrderController = async (req, res) => {
  try {
    const {
      user_id,
      partner_id,
      category_id,
      address,
      price,
      platform_fee,
      items
    } = req.body;

    if (!user_id || !address) {
      return res.status(400).json({
        success: false,
        message: "user_id and address are required",
      });
    }

    const order = await orderModel.createOrder(
      user_id,
      partner_id,
      category_id,
      address,
      price,
      platform_fee,
      items || []
    );

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.getOrders();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrderController,
  getOrdersController,
};