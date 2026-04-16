const pool = require("../db/db");

const createPayment = async (order_id, amount, payment_method, payment_status, transaction_id) => {
  const result = await pool.query(
    `INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [order_id, amount, payment_method, payment_status, transaction_id]
  );

  return result.rows[0];
};

const getPayments = async () => {
  const result = await pool.query(
    "SELECT * FROM payments ORDER BY created_at DESC"
  );
  return result.rows;
};

module.exports = {
  createPayment,
  getPayments,
};