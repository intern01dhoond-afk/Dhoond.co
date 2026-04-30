require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const roServices = [
  { title: 'Water Purifier Inspection', category: 'technician', op: 299, dp: 149, tag: '50% OFF', desc: 'Expert inspection of your water purifier and filter health check.', img: '/services/ro_inspection.png' },
  { title: 'Water Purifier Installation', category: 'technician', op: 799, dp: 549, tag: '31% OFF', desc: 'Professional installation and setup of new water purifier.', img: '/services/water_purifier.png' },
  { title: 'Water Purifier Uninstallation', category: 'technician', op: 399, dp: 249, tag: '37% OFF', desc: 'Safe uninstallation and packing of your water purifier.', img: '/services/ro_uninstallation.png' },
];

async function updateROServices() {
  try {
    // Delete existing RO services from technician category
    // We'll search for 'RO' or 'Water Purifier' in the title to be safe
    const deleteRes = await pool.query(
      "DELETE FROM services WHERE category = 'technician' AND (title ILIKE '%RO%' OR title ILIKE '%Water Purifier%')"
    );
    console.log(`Deleted ${deleteRes.rowCount} old RO services.`);

    for (const s of roServices) {
      await pool.query(
        'INSERT INTO services (title, category, original_price, discount_price, discount_tag, description, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [s.title, s.category, s.op, s.dp, s.tag, s.desc, s.img]
      );
      console.log(`Inserted: ${s.title}`);
    }
    console.log('RO services updated successfully!');
  } catch (err) {
    console.error('Error updating RO services:', err);
  } finally {
    await pool.end();
  }
}

updateROServices();
