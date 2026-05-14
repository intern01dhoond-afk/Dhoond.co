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
      items,
      service_date,
      service_slot
    } = req.body;

    if (!user_id || !address) {
      return res.status(400).json({
        success: false,
        message: "user_id and address are required",
      });
    }

    const sanitizedUserId = user_id === 'AMEC01' ? 1 : user_id;

    const order = await orderModel.createOrder(
      sanitizedUserId,
      partner_id,
      category_id,
      address,
      price,
      platform_fee,
      items || [],
      service_date,
      service_slot
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

const updateOrderController = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ success: false, message: "id and status are required" });
    }
    const order = await orderModel.updateOrder(id, status);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSyncDetailsController = async (req, res) => {
  try {
    const { key } = req.params;
    if (!key) {
      return res.status(400).json({ success: false, message: "key is required" });
    }
    const data = await orderModel.getSyncDetails(key);
    if (!data) {
      return res.status(404).json({ success: false, message: "No records found" });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBookedSlotsController = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: "date is required" });
    }
    const bookedSlots = await orderModel.getBookedSlots(date);
    res.status(200).json({ success: true, data: bookedSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrderController,
  getOrdersController,
  updateOrderController,
  getSyncDetailsController,
  getBookedSlotsController,
};