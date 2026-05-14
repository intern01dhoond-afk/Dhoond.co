const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkOtps() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM otps');
    console.log('Current pending OTPs:', res.rows[0].count);
    
    const recent = await pool.query('SELECT phone, expires_at FROM otps ORDER BY expires_at DESC LIMIT 10');
    console.table(recent.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkOtps();
