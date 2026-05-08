require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateExhaustImages() {
  try {
    const targetImage = '/services/exhaust_fan_uninstall.png';
    const titles = ['Exhaust Fan Installation', 'Exhaust Fan Uninstallation'];
    
    for (const title of titles) {
      await pool.query(
        'UPDATE services SET image = $1 WHERE title = $2 AND category = $3',
        [targetImage, title, 'electrician']
      );
      console.log(`Updated image for: ${title}`);
    }
    console.log('Images updated successfully!');
  } catch (err) {
    console.error('Error updating images:', err);
  } finally {
    await pool.end();
  }
}

updateExhaustImages();
