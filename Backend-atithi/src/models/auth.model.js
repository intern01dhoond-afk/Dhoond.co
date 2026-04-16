
const pool = require("../db/db");

const upsertUser = async (phone, name) => {
  const result = await pool.query(
    `INSERT INTO users (phone, name) VALUES ($1, $2) ON CONFLICT (phone) DO UPDATE SET name = COALESCE(users.name, EXCLUDED.name) RETURNING *`,
    [phone, name || '']
  );
  return result.rows[0];
};

module.exports = { upsertUser };
