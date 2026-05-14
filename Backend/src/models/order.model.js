const pool = require('../db/db.js'); 

const createOrder = async (user_id, partner_id, category_id, address, price, platform_fee, items = [], service_date = null, service_slot = null) => {
  const insertRes = await pool.query(
    `INSERT INTO orders (user_id, partner_id, category_id, address, price, platform_fee, items, service_date, service_slot)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [user_id, partner_id, category_id, address, price, platform_fee, JSON.stringify(items), service_date, service_slot]
  );

  const orderId = insertRes.rows[0].id;

  // Fetch the order back with the daily_sequence calculated
  const result = await pool.query(
    `SELECT *, (
       SELECT COUNT(*) + 1 
       FROM orders 
       WHERE created_at::date = o.created_at::date 
       AND created_at < o.created_at
     ) as daily_sequence 
     FROM orders o 
     WHERE id = $1`,
    [orderId]
  );

  return result.rows[0];
};

const getOrders = async () => {
  const result = await pool.query(
    "SELECT *, ROW_NUMBER() OVER (PARTITION BY created_at::date ORDER BY created_at ASC) as daily_sequence FROM orders ORDER BY created_at DESC"
  );
  return result.rows;
};

const getOrdersByUserId = async (user_id) => {
  // If user_id is not a number (e.g. "AMEC01"), return empty list instead of crashing
  if (isNaN(Number(user_id))) {
    return [];
  }
  const result = await pool.query(
    "SELECT *, ROW_NUMBER() OVER (PARTITION BY created_at::date ORDER BY created_at ASC) as daily_sequence FROM orders WHERE user_id = $1::int ORDER BY created_at DESC",
    [user_id]
  );
  return result.rows;
};

const updateOrder = async (id, status) => {
  const result = await pool.query(
    "UPDATE orders SET status = $1 WHERE id = $2::int RETURNING *",
    [status, id]
  );
  return result.rows[0];
};

const getSyncDetails = async (key) => {
  let result;
  let idToSearch = null;

  // Extract ID from formatted strings (e.g., 0001 from DHD-11.05-0001)
  const parts = key.split('-');
  const lastPart = parts[parts.length - 1];
  const idMatch = lastPart.match(/\d+/);
  if (idMatch) idToSearch = parseInt(idMatch[0]);

  // 1. Try search by Order ID (joined with users)
  if (idToSearch) {
    result = await pool.query(
      `SELECT u.name, o.address, u.phone 
       FROM orders o 
       JOIN users u ON u.id = o.user_id 
       WHERE o.id = $1`,
      [idToSearch]
    );
    if (result.rows.length > 0) return result.rows[0];
  }

  // 2. Try search by Booking ID (if exists)
  if (idToSearch) {
    result = await pool.query(
      "SELECT customer_name as name, address, phone FROM bookings WHERE id = $1::int",
      [idToSearch]
    );
    if (result.rows.length > 0) return result.rows[0];
  }

  // 3. Try search by Phone (numeric check)
  const cleanPhone = key.replace(/\D/g, '');
  if (cleanPhone.length >= 10) {
    // Search in users + latest order
    result = await pool.query(
      `SELECT u.name, o.address, u.phone 
       FROM users u 
       LEFT JOIN orders o ON o.user_id = u.id 
       WHERE u.phone LIKE $1 
       ORDER BY o.created_at DESC LIMIT 1`,
      [`%${cleanPhone}`]
    );
    if (result.rows.length > 0) return result.rows[0];

    // Search in bookings
    result = await pool.query(
      "SELECT customer_name as name, address, phone FROM bookings WHERE phone LIKE $1 LIMIT 1",
      [`%${cleanPhone}`]
    );
    if (result.rows.length > 0) return result.rows[0];
  }

  return null;
};

const getBookedSlots = async (date) => {
  const result = await pool.query(
    "SELECT service_slot FROM orders WHERE service_date = $1 AND status != 'Cancelled'",
    [date]
  );
  return result.rows.map(row => row.service_slot);
};

module.exports = {
  createOrder,
  getOrders,
  getOrdersByUserId,
  updateOrder,
  getSyncDetails,
  getBookedSlots,
};