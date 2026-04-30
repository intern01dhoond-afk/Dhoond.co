require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const updates = [
  { title: 'Ceiling Fan Installation', img: '/services/electrician_ceiling_fan_install.png' },
  { title: 'Ceiling Fan Only Uninstallation', img: '/services/electrician_ceiling_fan_only_uninstall.png' },
  { title: 'Ceiling Fan Reinstallation', img: '/services/electrician_ceiling_fan_reinstall.png' },
  { title: 'Ceiling Fan Replacement', img: '/services/electrician_ceiling_fan_replacement.png' },
  { title: 'Wall Fan Installation', img: '/services/wall_fan_installation_man.png' },
  { title: 'Wall Fan Unistallation', img: '/services/wall_fan_uninstallation_.png' },
  { title: 'Exhaust Fan Installation', img: '/services/exhaust_fan_install_uninstall.png' },
  { title: 'Exhaust Fan Uninstallation', img: '/services/exhaust_fan_uninstall.png' },
  { title: 'Switch Replacement', img: '/services/ac_switchbox_installation.png' }, // fallback
  { title: 'Socket Replacement', img: '/services/socket_repair.png' },
  { title: 'Holder Replacement', img: '/services/holder_replacement.png' },
  { title: 'Switchbox Installation (3 point)', img: '/services/ac_switchbox_installation.png' },
  { title: 'AC Switchbox Installation', img: '/services/ac_switchbox_installation.png' },
  { title: 'Switchboard Installation (6 points)', img: '/services/switchboard_installation_6_points_.png' },
  { title: 'Switchboard Repair (Only Switchboard inspection)', img: '/services/switchboard_repair_only_switchboard_inspection_.png' },
  { title: 'New external wiring with casing (upto 5m)', img: '/services/external_wiring.png' },
  { title: 'Wiring without casing (upto 5m)', img: '/services/external_wiring.png' },
  { title: 'New internal wiring (upto 5m)', img: '/services/internal_wiring.png' },
  { title: 'Doorbell installation', img: '/services/doorbell.png' },
  { title: 'Doorbell replacement', img: '/services/doorbell_replacement.png' },
  { title: 'Submeter installation', img: '/services/submeter.png' },
  { title: 'Geyser installation', img: '/services/geyser.png' },
  { title: 'Electrician Visit', img: '/services/electrician_visit.png' },
  { title: 'Free Consultation On Call', img: '/services/free_consultation.png' },
];

async function updateImages() {
  try {
    for (const u of updates) {
      await pool.query(
        'UPDATE services SET image = $1 WHERE title = $2 AND category = $3',
        [u.img, u.title, 'electrician']
      );
      console.log(`Updated image for: ${u.title}`);
    }
    console.log('Images updated successfully!');
  } catch (err) {
    console.error('Error updating images:', err);
  } finally {
    await pool.end();
  }
}

updateImages();
