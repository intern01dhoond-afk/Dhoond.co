require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const acServices = [
  { title: 'AC Inspection (Visit)', dp: 299, op: 499 },
  { title: 'Normal AC Service + Cleaning', dp: 449, op: 699 },
  { title: 'AC Service (Jet + Water)', dp: 569, op: 899 },
  { title: 'AC Service (Jet + Foam)', dp: 669, op: 999 },
  { title: 'AC Gas Top-up', dp: 1999, op: 2999 },
  { title: 'AC Gas Refill', dp: 2999, op: 4499 },
  { title: 'Split AC Installation', dp: 1899, op: 2799 },
  { title: 'Window AC Installation', dp: 1399, op: 2099 },
  { title: 'Split AC Uninstallation', dp: 699, op: 999 },
  { title: 'Window AC Uninstallation', dp: 559, op: 799 },
  { title: 'AC Re-installation', dp: 2300, op: 3499 },
  { title: 'AC Outdoor Unit Re-Installation', dp: 1449, op: 2199 },
  { title: 'AC Pipe Fitting charges (per. feet)', dp: 100, op: 150 }
];

async function updateACServices() {
  try {
    for (const s of acServices) {
      const discountTag = Math.round((1 - s.dp/s.op) * 100) + '% OFF';
      
      // Upsert: Try to update by title, if not found, insert
      const res = await pool.query(
        "UPDATE services SET discount_price = $1, original_price = $2, discount_tag = $3 WHERE title = $4 AND category = 'technician' RETURNING id",
        [s.dp, s.op, discountTag, s.title]
      );

      if (res.rowCount === 0) {
        // Insert new
        const description = `${s.title} — Expert AC service for your comfort.`;
        const image = '/services/AC Technician.png';
        await pool.query(
          "INSERT INTO services (title, category, original_price, discount_price, discount_tag, description, image) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [s.title, 'technician', s.op, s.dp, discountTag, description, image]
        );
        console.log(`Inserted: ${s.title}`);
      } else {
        console.log(`Updated: ${s.title}`);
      }
    }
    console.log('AC services updated successfully!');
  } catch (err) {
    console.error('Error updating AC services:', err);
  } finally {
    await pool.end();
  }
}

updateACServices();
