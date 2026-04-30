const pool = require('../db/db.js'); 

const createOrder = async (user_id, partner_id, category_id, address, price, platform_fee, items = []) => {
  const result = await pool.query(
    `INSERT INTO orders (user_id, partner_id, category_id, address, price, platform_fee, items)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [user_id, partner_id, category_id, address, price, platform_fee, JSON.stringify(items)]
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

module.exports = {
  createOrder,
  getOrders,
  getOrdersByUserId,
  updateOrder,
};