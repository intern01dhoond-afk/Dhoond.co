require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function listACServices() {
  try {
    const res = await pool.query("SELECT id, title, discount_price, original_price FROM services WHERE category = 'technician' AND (title ILIKE '%AC%' OR title ILIKE '%Air Cond%')");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

listACServices();
