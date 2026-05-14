const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkUserSchema() {
  try {
    const res = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users'");
    console.log('--- USERS SCHEMA ---');
    console.table(res.rows);
    
    const constraints = await pool.query("SELECT conname, contype FROM pg_constraint WHERE conrelid = 'users'::regclass");
    console.log('--- CONSTRAINTS ---');
    console.table(constraints.rows);
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await pool.end();
  }
}

checkUserSchema();
