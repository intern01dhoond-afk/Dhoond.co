const pool = require("../db/db");

const createPartner = async (partnerData) => {
  const { name, documents, profession, current_location, status, work_status } = partnerData;
  const result = await pool.query(
    `INSERT INTO partners (name, documents, profession, current_location, status, work_status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, documents, profession, current_location, status || 'Off duty', work_status || 'idle']
  );
  return result.rows[0];
};

const getPartners = async () => {
  const result = await pool.query("SELECT * FROM partners ORDER BY joined_at DESC");
  return { data: result.rows, total: result.rowCount };
};

const deletePartner = async (id) => {
  await pool.query("DELETE FROM partners WHERE id = $1", [id]);
};

module.exports = {
  createPartner,
  getPartners,
  deletePartner
};