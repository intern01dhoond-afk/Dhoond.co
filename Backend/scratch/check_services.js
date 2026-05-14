const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkServiceCount() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM services');
    console.log('Total Services in DB:', res.rows[0].count);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkServiceCount();
