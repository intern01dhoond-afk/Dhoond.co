const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkOrderUsers() {
  try {
    const res = await pool.query('SELECT COUNT(DISTINCT user_id) FROM orders');
    console.log('Unique users who have placed orders:', res.rows[0].count);
  } catch (err) {
    console.error('Error checking order users:', err);
  } finally {
    await pool.end();
  }
}

checkOrderUsers();
