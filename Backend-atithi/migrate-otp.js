require('dotenv').config();
const pool = require('./src/db/db');

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        phone VARCHAR(15) PRIMARY KEY,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('OTPs table ready.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
