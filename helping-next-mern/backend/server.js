require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Copy .env.example to .env and set it.");
  process.exit(1);
}

const connectDB = require("./src/config/db");
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Helping Next API running on http://localhost:${PORT}/api`)))
  .catch((err) => {
    console.error("Could not start server:", err.message);
    process.exit(1);
  });
