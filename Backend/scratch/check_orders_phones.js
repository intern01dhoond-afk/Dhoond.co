const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkOrders() {
  try {
    const res = await pool.query('SELECT DISTINCT phone FROM orders');
    console.log('Unique phone numbers in Orders:', res.rows.length);
    console.table(res.rows);
  } catch (err) {
    console.error('Error checking orders:', err);
  } finally {
    await pool.end();
  }
}

checkOrders();
