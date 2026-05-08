require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function listServices() {
  try {
    const res = await pool.query('SELECT DISTINCT category, category_id FROM services');
    console.log('Categories:', res.rows);
    
    const services = await pool.query('SELECT * FROM services LIMIT 20');
    console.log('Sample Services:', services.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

listServices();
