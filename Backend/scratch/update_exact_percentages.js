require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const updates = [
  // ELECTRICIAN
  { title: 'Ceiling Fan Installation', tag: '33.67% OFF', cat: 'electrician' },
  { title: 'Ceiling Fan Only Uninstallation', tag: '25.50% OFF', cat: 'electrician' },
  { title: 'Ceiling Fan Reinstallation', tag: '37.75% OFF', cat: 'electrician' },
  { title: 'Ceiling Fan Replacement', tag: '37.75% OFF', cat: 'electrician' },
  { title: 'Wall Fan Installation', tag: '27.75% OFF', cat: 'electrician' },
  { title: 'Wall Fan Unistallation', tag: '40.40% OFF', cat: 'electrician' },
  { title: 'Exhaust Fan Installation', tag: '42.20% OFF', cat: 'electrician' },
  { title: 'Exhaust Fan Uninstallation', tag: '50.33% OFF', cat: 'electrician' },
  { title: 'Switch Replacement', tag: '30.50% OFF', cat: 'electrician' },
  { title: 'Socket Replacement', tag: '10.50% OFF', cat: 'electrician' },
  { title: 'Holder Replacement', tag: '20.50% OFF', cat: 'electrician' },
  { title: 'Switchbox Installation (3 point)', tag: '34.73% OFF', cat: 'electrician' },
  { title: 'AC Switchbox Installation', tag: '38.50% OFF', cat: 'electrician' },
  { title: 'Switchboard Installation (6 points)', tag: '41.83% OFF', cat: 'electrician' },
  { title: 'Switchboard Repair (Only Switchboard inspection)', tag: '57.75% OFF', cat: 'electrician' },
  { title: 'New external wiring with casing (upto 5m)', tag: '50.17% OFF', cat: 'electrician' },
  { title: 'Wiring without casing (upto 5m)', tag: '50.20% OFF', cat: 'electrician' },
  { title: 'New internal wiring (upto 5m)', tag: '48.20% OFF', cat: 'electrician' },
  { title: 'Doorbell installation', tag: '40.40% OFF', cat: 'electrician' },
  { title: 'Doorbell replacement', tag: '43.67% OFF', cat: 'electrician' },
  { title: 'Submeter installation', tag: '30.20% OFF', cat: 'electrician' },
  { title: 'Geyser installation', tag: '25.17% OFF', cat: 'electrician' },
  { title: 'Electrician Visit', tag: '33.67% OFF', cat: 'electrician' },
  
  // RO
  { title: 'Water Purifier Inspection', tag: '30.20% OFF', cat: 'technician' },
  { title: 'Water Purifier Installation', tag: '25.17% OFF', cat: 'technician' },
  { title: 'Water Purifier Uninstallation', tag: '50.25% OFF', cat: 'technician' },
];

async function updateExactPercentages() {
  try {
    for (const u of updates) {
      await pool.query(
        'UPDATE services SET discount_tag = $1 WHERE title = $2 AND category = $3',
        [u.tag, u.title, u.cat]
      );
      console.log(`Updated tag for: ${u.title} -> ${u.tag}`);
    }
    console.log('All discount tags updated with exact percentages!');
  } catch (err) {
    console.error('Error updating tags:', err);
  } finally {
    await pool.end();
  }
}

updateExactPercentages();
