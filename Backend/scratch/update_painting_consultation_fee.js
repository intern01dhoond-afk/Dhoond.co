require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateConsultationFee() {
  try {
    const ids = [96, 97];
    for (const id of ids) {
      await pool.query(
        "UPDATE services SET discount_price = 49, discount_tag = '90% OFF' WHERE id = $1",
        [id]
      );
      console.log(`Updated service ID ${id} to ₹49`);
    }
    console.log('Consultation fees updated successfully!');
  } catch (err) {
    console.error('Error updating consultation fees:', err);
  } finally {
    await pool.end();
  }
}

updateConsultationFee();
