require('dotenv').config();
const pool = require("./src/db/db");

async function updatePrices() {
  try {
    const result = await pool.query(
      "UPDATE services SET discount_price = 1 WHERE category = 'consultation' OR title ILIKE '%Consultation%' OR title ILIKE '%Expert%' RETURNING *"
    );
    console.log(`Updated ${result.rowCount} services to ₹1.`);
    result.rows.forEach(r => console.log(` - ${r.title}: ₹${r.discount_price}`));
    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err.message);
    process.exit(1);
  }
}

updatePrices();
