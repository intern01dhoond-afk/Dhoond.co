const adminModel = require("../models/admin.model");

const getStatsController = async (req, res) => {
  try {
    const stats = await adminModel.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStatsController
};
