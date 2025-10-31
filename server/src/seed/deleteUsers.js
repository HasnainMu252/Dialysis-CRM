// deleteUsers.js
import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";

await connectDB();
await User.deleteMany({});
console.log("✅ All users deleted");
process.exit(0);
