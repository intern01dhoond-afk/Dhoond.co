const pool = require("../db/db");

const createOrder = async (user_id, partner_id, category_id, address, price, platform_fee, items = []) => {
  // We use a subquery to get the next daily sequence number (resets every day)
  const result = await pool.query(
    `INSERT INTO orders (user_id, partner_id, category_id, address, price, platform_fee, items, daily_sequence)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 
       (SELECT COALESCE(MAX(daily_sequence), 0) + 1 FROM orders WHERE created_at::date = CURRENT_DATE)
     )
     RETURNING *`,
    [user_id, partner_id, category_id, address, price, platform_fee, JSON.stringify(items)]
  );

  return result.rows[0];
};

const getOrders = async () => {
  const result = await pool.query(
    "SELECT * FROM orders ORDER BY created_at DESC"
  );
  return result.rows;
};

const getOrdersByUserId = async (user_id) => {
  const result = await pool.query(
    "SELECT * FROM orders WHERE user_id = $1::int ORDER BY created_at DESC",
    [user_id]
  );
  return result.rows;
};

const updateOrderStatus = async (id, status) => {
  const result = await pool.query(
    "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  return result.rows[0];
};

module.exports = {
  createOrder,
  getOrders,
  getOrdersByUserId,
  updateOrderStatus,
};