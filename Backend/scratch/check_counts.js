const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkCounts() {
  try {
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const orders = await pool.query('SELECT COUNT(*) FROM orders');
    const partners = await pool.query('SELECT COUNT(*) FROM partners');
    
    console.log('--- DB COUNTS ---');
    console.log('Users:', users.rows[0].count);
    console.log('Orders:', orders.rows[0].count);
    console.log('Partners:', partners.rows[0].count);
    
    // Check if there are any "active" users specifically?
    const activeUsers = await pool.query("SELECT COUNT(*) FROM users WHERE role != 'admin'");
    console.log('Non-Admin Users:', activeUsers.rows[0].count);

  } catch (err) {
    console.error('Error checking counts:', err);
  } finally {
    await pool.end();
  }
}

checkCounts();
