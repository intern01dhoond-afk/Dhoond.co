try {
  const pool = require("../src/db/db");
  console.log("Successfully required pool");
  process.exit(0);
} catch (err) {
  console.error("Failed to require pool:", err.message);
  process.exit(1);
}
