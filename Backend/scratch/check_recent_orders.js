const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkRecentOrders() {
  try {
    const res = await pool.query('SELECT id, user_id, status, created_at FROM orders ORDER BY created_at DESC LIMIT 20');
    console.log('--- RECENT ORDERS ---');
    console.table(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkRecentOrders();
