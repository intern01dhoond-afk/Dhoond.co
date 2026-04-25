const pool = require("../db/db");

const createUser = async (name, phone, email) => {
  const result = await pool.query(
    "INSERT INTO users (name, phone, email) VALUES ($1, $2, $3) RETURNING *",
    [name, phone, email]
  );
  return result.rows[0];
};

const getUsers = async () => {
  const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
  return result.rows;
};

const getUserById = async (id) => {
  // Use explicit casting for robustness
  const result = await pool.query("SELECT * FROM users WHERE id = $1::int", [id]);
  return result.rows[0];
};

const getUserByPhone = async (phone) => {
  const result = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
  return result.rows[0];
};

const updateUserById = async (id, { name, email }) => {
  // Build query dynamically — only update fields that are actually provided
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined && name !== null) { fields.push(`name = $${idx++}`); values.push(name); }
  if (email !== undefined && email !== null) { fields.push(`email = $${idx++}`); values.push(email); }

  if (fields.length === 0) {
    // Nothing to update — just return current user
    return getUserById(id);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}::int RETURNING *`,
    values
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  getUserByPhone,
  updateUserById,
};