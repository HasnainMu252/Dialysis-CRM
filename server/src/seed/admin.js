import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";

await connectDB();

const run = async () => {
  const email = "admin@dialysiscrm.com";
  await User.deleteMany({});

  const admin = await User.create({
    name: "System Admin",
    email,
    password: "Admin@12345", // plain text
    role: "Admin"
  });

  console.log("✅ Created admin:", admin.email);
  console.log("🔐 Stored password:", admin.password);

  process.exit(0);
};

run();
