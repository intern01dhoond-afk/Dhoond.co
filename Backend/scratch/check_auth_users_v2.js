const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAuthUsers() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM auth.users');
    console.log('Auth Users Count:', res.rows[0].count);
    
    const recent = await pool.query('SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5');
    console.table(recent.rows);
  } catch (err) {
    console.error('Error checking auth.users:', err.message);
  } finally {
    await pool.end();
  }
}

checkAuthUsers();
