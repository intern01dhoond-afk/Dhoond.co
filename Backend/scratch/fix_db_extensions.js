const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fix() {
  try {
    const r1 = await pool.query("UPDATE services SET image = REPLACE(image, '.png', '.webp') WHERE image LIKE '%.png'");
    console.log('Fixed PNGs:', r1.rowCount);
    const r2 = await pool.query("UPDATE services SET image = REPLACE(image, '.jpg', '.webp') WHERE image LIKE '%.jpg'");
    console.log('Fixed JPGs:', r2.rowCount);
    const r3 = await pool.query("UPDATE services SET image = REPLACE(image, '.jpeg', '.webp') WHERE image LIKE '%.jpeg'");
    console.log('Fixed JPEGs:', r3.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

fix();
