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
  const result = await pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3::int RETURNING *",
    [name, email, id]
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