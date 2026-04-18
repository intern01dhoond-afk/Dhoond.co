const pool = require("../db/db");

const getStats = async () => {
  const usersCount = (await pool.query('SELECT COUNT(*) FROM users')).rows[0].count;
  
  const totalOrdersRes = await pool.query('SELECT COUNT(*) FROM orders');
  const totalOrders = parseInt(totalOrdersRes.rows[0].count);

  const totalRevenueRes = await pool.query(
    "SELECT COALESCE(SUM(amount::numeric), 0) AS total FROM payments WHERE LOWER(payment_status) IN ('success', 'paid')"
  );
  const totalRevenue = parseFloat(totalRevenueRes.rows[0].total);

  // Recent orders joined with payments for real status/amount
  const recentOrdersRes = await pool.query(`
    SELECT
      o.id,
      u.name  AS customer_name,
      u.phone AS phone,
      o.price + o.platform_fee AS total_amount,
      o.status,
      o.created_at,
      COALESCE(p.payment_status, 'Unpaid') AS payment_status,
      COALESCE(p.payment_method, '')       AS payment_method,
      COALESCE(p.amount::numeric, 0)       AS paid_amount,
      p.transaction_id,
      o.daily_sequence
    FROM orders o
    LEFT JOIN users    u ON u.id = o.user_id
    LEFT JOIN payments p ON p.order_id = o.id
    ORDER BY o.created_at DESC
    LIMIT 10
  `);

  return {
    summary: {
      totalRevenue,
      totalBookings: totalOrders,
      totalUsers: parseInt(usersCount),
    },
    recentBookings: recentOrdersRes.rows,
  };
};

const getAllBookings = async () => {
  // Now fetches from orders + payments join (the correct linked data)
  const result = await pool.query(`
    SELECT
      o.id,
      u.name  AS customer_name,
      u.phone AS phone,
      o.address,
      o.price + o.platform_fee AS total_amount,
      o.status,
      o.created_at,
      COALESCE(p.payment_status, 'Unpaid') AS payment_status,
      COALESCE(p.payment_method, '')       AS payment_method,
      COALESCE(p.amount::numeric, 0)       AS paid_amount,
      p.transaction_id,
      o.daily_sequence
    FROM orders o
    LEFT JOIN users    u ON u.id = o.user_id
    LEFT JOIN payments p ON p.order_id = o.id
    ORDER BY o.created_at DESC
  `);
  return result.rows;
};

const updateBookingStatus = async (id, status) => {
  const result = await pool.query(
    'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
};

const assignPartner = async (orderId, partnerId) => {
  const result = await pool.query(
    `UPDATE orders SET partner_id = $1, status = 'Confirmed' WHERE id = $2 RETURNING *`,
    [partnerId, orderId]
  );
  return result.rows[0];
};

module.exports = { getStats, getAllBookings, updateBookingStatus, assignPartner };
