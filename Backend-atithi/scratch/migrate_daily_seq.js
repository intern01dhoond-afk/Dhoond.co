require("dotenv").config();
const pool = require("../src/db/db");

async function setup() {
  try {
    console.log("Adding daily_sequence column...");
    await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS daily_sequence INTEGER");
    
    // Backfill existing orders with a sequence based on their ID order within each day
    console.log("Backfilling existing orders...");
    await pool.query(`
      WITH RankedOrders AS (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY created_at::date ORDER BY id) as seq
        FROM orders
      )
      UPDATE orders
      SET daily_sequence = RankedOrders.seq
      FROM RankedOrders
      WHERE orders.id = RankedOrders.id
    `);
    
    console.log("Setup complete");
    process.exit(0);
  } catch (err) {
    console.error("Setup failed:", err);
    process.exit(1);
  }
}

setup();
