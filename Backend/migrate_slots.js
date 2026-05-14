
const { Pool } = require("pg");
require('dotenv').config();

async function migrate() {
  const configs = [
    {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    {
      connectionString: process.env.DATABASE_URL,
      ssl: false,
    }
  ];

  for (const config of configs) {
    const pool = new Pool(config);
    try {
      console.log(`Trying migration with ssl: ${JSON.stringify(config.ssl)}...`);
      await pool.query(`
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS service_date TEXT,
        ADD COLUMN IF NOT EXISTS service_slot TEXT;
      `);
      console.log("Migration successful!");
      await pool.end();
      return;
    } catch (err) {
      console.error(`Migration failed with ssl ${JSON.stringify(config.ssl)}:`, err.message);
      await pool.end();
    }
  }
  console.error("All migration attempts failed.");
}

migrate();
