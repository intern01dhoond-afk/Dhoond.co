const { Pool } = require("pg");

// Support both individual vars and a full DATABASE_URL (Neon, Railway, Render etc.)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 20,                          // Maximum connections in the pool
        idleTimeoutMillis: 30000,         // Close idle clients after 30 sec
        connectionTimeoutMillis: 2000,    // Wait 2 sec for a connection
      }
    : {
        // Local development — no SSL needed
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host:     process.env.DB_HOST,
        port:     Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
      }
);

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

module.exports = pool;