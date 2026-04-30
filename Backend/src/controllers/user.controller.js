const userModel = require("../models/user.model");
const orderModel = require("../models/order.model");

const createUserController = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const user = await userModel.createUser(name, phone, email);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "Phone or email already exists",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

const getUsersController = async (req, res) => {
  const users = await userModel.getUsers();
  res.json(users);
};

const getUserProfileController = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone } = req.query;
    
    console.log(`[Backend Profile] Request ID: ${id}, Phone Query: ${phone}`);
    
    let user;
    const effectiveId = id === 'AMEC01' ? 1 : id;

    if (effectiveId && effectiveId !== 'undefined' && effectiveId !== 'null') {
      user = await userModel.getUserById(effectiveId);
      if (user) console.log(`[Backend Profile] Found by ID: ${user.id}`);
    }
    
    if (!user && phone) {
      // Clean phone just in case
      const digits = String(phone).replace(/\D/g, '').slice(-10);
      user = await userModel.getUserByPhone(digits);
      if (user) console.log(`[Backend Profile] Found by Phone: ${user.phone} -> ID: ${user.id}`);
    }

    if (!user) {
      console.warn(`[Backend Profile] User NOT FOUND for ID: ${id}, Phone: ${phone}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const bookings = await orderModel.getOrdersByUserId(user.id);
    console.log(`[Backend Profile] Found ${bookings.length} bookings for user ${user.id}`);
    
    const formattedBookings = bookings.map(b => ({
      ...b,
      total_amount: Number(b.price || 0) + Number(b.platform_fee || 0),
      status: b.status || 'Pending',
      payment_status: 'Paid'
    }));

    res.json({ success: true, user, bookings: formattedBookings });
  } catch (error) {
    console.error("[Backend Profile Error]", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserProfileController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const user = await userModel.updateUserById(id, { name, email });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createUserController,
  getUsersController,
  getUserProfileController,
  updateUserProfileController
};