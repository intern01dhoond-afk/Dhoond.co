require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateWMFrontLoadImage() {
  try {
    const targetImage = '/services/washing_machine_inspection_fully_automatic_front_load_.png';
    const targetTitle = "Washing Machine Installation 'Fully-automatic front load'";
    
    const res = await pool.query(
      'UPDATE services SET image = $1 WHERE title = $2 AND category = $3',
      [targetImage, targetTitle, 'technician']
    );
    
    if (res.rowCount > 0) {
      console.log(`Updated image for: ${targetTitle}`);
    } else {
      console.log('Service not found or already updated.');
    }
  } catch (err) {
    console.error('Error updating image:', err);
  } finally {
    await pool.end();
  }
}

updateWMFrontLoadImage();
