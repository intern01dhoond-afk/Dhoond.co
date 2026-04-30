require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const acImageUpdates = [
  { title: 'AC Inspection (Visit)', img: '/services/ac_inspection.png' },
  { title: 'Normal AC Service + Cleaning', img: '/services/ac_repair.png' },
  { title: 'AC Service (Jet + Water)', img: '/services/ac_tachnician_jet_water.png' },
  { title: 'AC Service (Jet + Foam)', img: '/services/ac_tachnician_foam_jet_water.png' },
  { title: 'AC Gas Top-up', img: '/services/ac_gas_top_up.png' },
  { title: 'AC Gas Refill', img: '/services/ac_gas_repair.png' },
  { title: 'Split AC Installation', img: '/services/ac_installation_uninstallation.png' },
  { title: 'Window AC Installation', img: '/services/ac_nstall_uninstall_window_.png' },
  { title: 'Split AC Uninstallation', img: '/services/ac_uninstallation_split.png' },
  { title: 'Window AC Uninstallation', img: '/services/ac_uninstallation_window_.png' },
  { title: 'AC Re-installation', img: '/services/ac_reinstallation.png' },
  { title: 'AC Outdoor Unit Re-Installation', img: '/services/ac_nstall_uninstall_outdoor_.png' },
];

async function updateExactACImages() {
  try {
    for (const u of acImageUpdates) {
      await pool.query(
        'UPDATE services SET image = $1 WHERE title = $2 AND category = $3',
        [u.img, u.title, 'technician']
      );
      console.log(`Updated exact image for: ${u.title}`);
    }
    console.log('All AC images updated with exact SKU matches!');
  } catch (err) {
    console.error('Error updating images:', err);
  } finally {
    await pool.end();
  }
}

updateExactACImages();
