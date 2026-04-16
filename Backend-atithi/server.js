require("dotenv").config();
const app = require("./src/app");
const pool = require("./src/db/db");

const PORT = process.env.PORT || 5001;




app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} `);
});

pool
  .connect()
  .then(() => {
    console.log("DB Connected ");
  })
  .catch((err) => {
    console.log("DB Connection Failed ", err.message);
  });
