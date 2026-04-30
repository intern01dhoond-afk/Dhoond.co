require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function listTechnicianServices() {
  try {
    const res = await pool.query("SELECT id, title, category FROM services WHERE category = 'technician' ORDER BY title");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

listTechnicianServices();
