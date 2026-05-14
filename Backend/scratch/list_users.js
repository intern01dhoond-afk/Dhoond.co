const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function listUsers() {
  try {
    const res = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    console.log('--- USERS LIST ---');
    console.table(res.rows.map(u => ({ id: u.id, name: u.name, phone: u.phone, role: u.role, created: u.created_at })));
  } catch (err) {
    console.error('Error listing users:', err);
  } finally {
    await pool.end();
  }
}

listUsers();
