require("dotenv").config();
const app = require("./src/app");
const pool = require("./src/db/db");

const PORT = 5001; // Forced to 5001 to handle ghost process on 5000




pool
  .connect()
  .then(() => {
    console.log("DB Connected ");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} `);
    });
  })
  .catch((err) => {
    console.log("DB Connection Failed ", err.message);
  });
