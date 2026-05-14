require('dotenv').config();
const pool = require('./src/db/db.js');
const adminModel = require('./src/models/admin.model.js');

async function testStats() {
  try {
    const stats = await adminModel.getStats();
    console.log('--- ADMIN STATS API OUTPUT ---');
    console.log(JSON.stringify(stats.summary, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

testStats();
