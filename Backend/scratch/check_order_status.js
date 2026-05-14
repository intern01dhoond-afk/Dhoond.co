const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkOrderStatus() {
  try {
    const res = await pool.query('SELECT status, COUNT(*) FROM orders GROUP BY status');
    console.log('--- ORDER STATUS COUNTS ---');
    console.table(res.rows);
  } catch (err) {
    console.error('Error checking order status:', err);
  } finally {
    await pool.end();
  }
}

checkOrderStatus();
