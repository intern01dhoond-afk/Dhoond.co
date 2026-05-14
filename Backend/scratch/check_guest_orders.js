const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkGuestOrders() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM orders WHERE user_id IS NULL');
    console.log('Orders with no user_id (Guest?):', res.rows[0].count);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkGuestOrders();
