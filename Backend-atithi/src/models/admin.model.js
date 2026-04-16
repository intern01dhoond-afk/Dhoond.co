const pool = require("../db/db");

const getStats = async () => {
  const usersCount = (await pool.query('SELECT COUNT(*) FROM users')).rows[0].count;
  const servicesCount = (await pool.query('SELECT COUNT(*) FROM services')).rows[0].count;
  const partnersCount = (await pool.query('SELECT COUNT(*) FROM partners')).rows[0].count;
  const activeOrdersCount = (await pool.query("SELECT COUNT(*) FROM bookings WHERE status NOT IN ('Completed', 'Cancelled')")).rows[0].count;
  
  return {
    totalUsers: parseInt(usersCount),
    activeServices: parseInt(servicesCount),
    totalPartners: parseInt(partnersCount),
    activeOrders: parseInt(activeOrdersCount),
    revenue: 125000 // Dummy revenue for now since we don't track payments table
  };
};

module.exports = { getStats };
