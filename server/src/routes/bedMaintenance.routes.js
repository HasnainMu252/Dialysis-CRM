import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import { releaseMaintenanceBeds } from "../controllers/bedMaintenance.controller.js";

const router = Router();
router.use(requireAuth);

// Admin or Nurse can trigger
router.post("/release", authorizeRoles("Admin","Nurse"), releaseMaintenanceBeds);

export default router;
