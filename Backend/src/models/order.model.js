const pool = require("../db/db"); 

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
  const result = await pool.query(
    "SELECT *, ROW_NUMBER() OVER (PARTITION BY created_at::date ORDER BY created_at ASC) as daily_sequence FROM orders WHERE user_id = $1::int ORDER BY created_at DESC",
    [user_id]
  );
  return result.rows;
};

module.exports = {
  createOrder,
  getOrders,
  getOrdersByUserId,
};