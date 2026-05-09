require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function listConsultations() {
  try {
    const res = await pool.query("SELECT id, title, discount_price FROM services WHERE title ILIKE '%Consultation%'");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

listConsultations();
