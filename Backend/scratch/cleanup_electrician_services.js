require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function cleanupServices() {
  try {
    // Delete all electrician services with ID < 173 (the starting ID of our new batch)
    const res = await pool.query('DELETE FROM services WHERE category = $1 AND id < 173', ['electrician']);
    console.log(`Deleted ${res.rowCount} old electrician services.`);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

cleanupServices();
