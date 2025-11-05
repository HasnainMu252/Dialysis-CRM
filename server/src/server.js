import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/error.js";
import authRoutes from "./routes/auth.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import referralRoutes from "./routes/referral.routes.js";
import bedRoutes from './routes/bed.routes.js'
// (add more routes as you build them)

const app = express();

// middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// routes
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/auth/me", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/beds", bedRoutes);

// errors
app.use(notFound);
app.use(errorHandler);

// start
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on :${PORT}`));
});
