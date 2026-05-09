const pool = require('../db/db.js'); 

const createOrder = async (user_id, partner_id, category_id, address, price, platform_fee, items = []) => {
  const insertRes = await pool.query(
    `INSERT INTO orders (user_id, partner_id, category_id, address, price, platform_fee, items)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [user_id, partner_id, category_id, address, price, platform_fee, JSON.stringify(items)]
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

module.exports = {
  createOrder,
  getOrders,
  getOrdersByUserId,
  updateOrder,
};