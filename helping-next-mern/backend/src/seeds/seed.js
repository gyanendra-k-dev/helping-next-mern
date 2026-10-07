require("dotenv").config({ path: require("node:path").join(__dirname, "..", "..", ".env") });
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const mongoose = require("../config/mongoose");
const { User } = require("../models");

// Same three demo accounts the Laravel DatabaseSeeder created. Safe to run repeatedly.
const USERS = [
  { name: "Admin User", email: "admin@helpingnext.org", phone: "9999900000", role: "admin", password: "admin123" },
  { name: "Riya Sharma", email: "donor@helpingnext.org", phone: "9999900001", role: "donor", password: "donor123" },
  { name: "Aman Kumar", email: "volunteer@helpingnext.org", phone: "9999900002", role: "volunteer", password: "volunteer123" },
];

(async () => {
  await connectDB();
  for (const u of USERS) {
    if (await User.exists({ email: u.email })) {
      console.log(`exists   ${u.email}`);
      continue;
    }
    await User.create({ ...u, password: await bcrypt.hash(u.password, Number(process.env.BCRYPT_ROUNDS || 12)) });
    console.log(`created  ${u.email}  (password: ${u.password})`);
  }
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
