require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const priceUpdates = [
  { title: 'Ceiling Fan Installation', op: 300, dp: 199, tag: '33% OFF' },
  { title: 'Ceiling Fan Only Uninstallation', op: 200, dp: 149, tag: '25% OFF' },
  { title: 'Ceiling Fan Reinstallation', op: 400, dp: 249, tag: '37% OFF' },
  { title: 'Ceiling Fan Replacement', op: 400, dp: 249, tag: '37% OFF' },
  { title: 'Wall Fan Installation', op: 400, dp: 289, tag: '27% OFF' },
  { title: 'Wall Fan Unistallation', op: 250, dp: 149, tag: '40% OFF' },
  { title: 'Exhaust Fan Installation', op: 500, dp: 289, tag: '42% OFF' },
  { title: 'Exhaust Fan Uninstallation', op: 300, dp: 149, tag: '50% OFF' },
  { title: 'Switch Replacement', op: 200, dp: 139, tag: '30% OFF' },
  { title: 'Socket Replacement', op: 200, dp: 179, tag: '10% OFF' },
  { title: 'Holder Replacement', op: 200, dp: 159, tag: '20% OFF' },
  { title: 'Switchbox Installation (3 point)', op: 550, dp: 359, tag: '34% OFF' },
  { title: 'AC Switchbox Installation', op: 600, dp: 369, tag: '38% OFF' },
  { title: 'Switchboard Installation (6 points)', op: 600, dp: 349, tag: '41% OFF' },
  { title: 'Switchboard Repair (Only Switchboard inspection)', op: 400, dp: 169, tag: '57% OFF' },
  { title: 'New external wiring with casing (upto 5m)', op: 600, dp: 299, tag: '50% OFF' },
  { title: 'Wiring without casing (upto 5m)', op: 500, dp: 249, tag: '50% OFF' },
  { title: 'New internal wiring (upto 5m)', op: 500, dp: 259, tag: '48% OFF' },
  { title: 'Doorbell installation', op: 250, dp: 149, tag: '40% OFF' },
  { title: 'Doorbell replacement', op: 300, dp: 169, tag: '43% OFF' },
  { title: 'Submeter installation', op: 500, dp: 349, tag: '30% OFF' },
  { title: 'Geyser installation', op: 600, dp: 449, tag: '25% OFF' },
  { title: 'Electrician Visit', op: 300, dp: 199, tag: '33% OFF' },
  { title: 'Free Consultation On Call', op: 150, dp: 0, tag: 'FREE' },
];

async function updatePrices() {
  try {
    for (const u of priceUpdates) {
      await pool.query(
        'UPDATE services SET original_price = $1, discount_price = $2, discount_tag = $3 WHERE title = $4 AND category = $5',
        [u.op, u.dp, u.tag, u.title, 'electrician']
      );
      console.log(`Updated price for: ${u.title}`);
    }
    console.log('All prices updated successfully!');
  } catch (err) {
    console.error('Error updating prices:', err);
  } finally {
    await pool.end();
  }
}

updatePrices();
