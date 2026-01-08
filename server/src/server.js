import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/error.js";
import patientRoutes from "./routes/patient.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";

import bedRoutes from "./routes/bed.routes.js";
import shiftRoutes from "./routes/shift.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import lifecycleRoutes from "./routes/sessionLifecycle.routes.js";
import maintenanceRoutes from "./routes/bedMaintenance.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import referrals from "./routes/referral.routes.js";
import patientsRoutes from "./routes/patient.routes.js";



import swaggerUi from "swagger-ui-express"; // ✅ you need this
import authRoutes from "./routes/auth.routes.js"; // Import the new auth routes
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const swaggerDocument = require("../swagger-output.json"); // ✅ load generated swagger file

const app = express();

// ✅ Swagger route must come after app = express()
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middlewares

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4000"],
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes); // Register the auth routes

// Routes
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/patients", patientRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/lifecycle", lifecycleRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/referrals", referrals);



app.use("/api/patients", patientsRoutes);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

// Server start
const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});
