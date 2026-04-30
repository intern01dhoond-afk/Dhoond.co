require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function debugServices() {
  try {
    const countRes = await pool.query('SELECT count(*) FROM services WHERE category = $1', ['electrician']);
    console.log('Total Electrician services:', countRes.rows[0].count);

    const res = await pool.query('SELECT id, title, category, discount_price FROM services WHERE category = $1 ORDER BY id', ['electrician']);
    res.rows.forEach(r => {
      console.log(`${r.id}: ${r.title} (₹${r.discount_price})`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

debugServices();
