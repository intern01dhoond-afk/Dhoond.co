require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const roPriceUpdates = [
  { title: 'Water Purifier Inspection', op: 500, dp: 349, tag: '30% OFF' },
  { title: 'Water Purifier Installation', op: 600, dp: 449, tag: '25% OFF' },
  { title: 'Water Purifier Uninstallation', op: 400, dp: 199, tag: '50% OFF' },
];

async function updateROPrices() {
  try {
    for (const u of roPriceUpdates) {
      await pool.query(
        'UPDATE services SET original_price = $1, discount_price = $2, discount_tag = $3 WHERE title = $4 AND category = $5',
        [u.op, u.dp, u.tag, u.title, 'technician']
      );
      console.log(`Updated price for: ${u.title}`);
    }
    console.log('RO prices updated successfully!');
  } catch (err) {
    console.error('Error updating RO prices:', err);
  } finally {
    await pool.end();
  }
}

updateROPrices();
