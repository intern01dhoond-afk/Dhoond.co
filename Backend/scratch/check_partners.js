const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkPartners() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM partners');
    console.log('Total Partners:', res.rows[0].count);
    
    const list = await pool.query('SELECT name, phone FROM partners');
    console.table(list.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkPartners();
