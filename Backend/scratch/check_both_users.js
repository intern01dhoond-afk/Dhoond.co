const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkPublicUsers() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users'");
    console.log('--- PUBLIC USERS SCHEMA ---');
    console.table(res.rows);
    
    const count = await pool.query("SELECT COUNT(*) FROM public.users");
    console.log('Public Users Count:', count.rows[0].count);

    // Check auth schema if it exists
    try {
      const authCount = await pool.query("SELECT COUNT(*) FROM auth.users");
      console.log('Auth Users Count:', authCount.rows[0].count);
    } catch (e) {
      console.log('Auth schema/table not accessible or does not exist.');
    }

  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await pool.end();
  }
}

checkPublicUsers();
