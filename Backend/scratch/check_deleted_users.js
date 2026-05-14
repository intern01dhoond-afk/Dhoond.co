const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDeletedUsers() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM users WHERE deleted_at IS NOT NULL');
    console.log('Deleted Users Count:', res.rows[0].count);
    
    const total = await pool.query('SELECT COUNT(*) FROM users');
    console.log('Total Users (Including Deleted):', total.rows[0].count);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkDeletedUsers();
