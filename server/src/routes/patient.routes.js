import { Router } from "express";
import {
  requireAuth,
  authorizeRoles,
  requirePatientAuth,
} from "../middleware/auth.js";

import {
  createPatient,
  getPatientProfile,
  listPatients,
  getPatient,
  updatePatient,
  removePatient,
  deleteAllPatients,
} from "../controllers/patient.controller.js";

const router = Router();

/**
 * ✅ PATIENT SELF ROUTE (no staff requireAuth here)
 * Patient token will work now.
 */
router.get("/me", requirePatientAuth, getPatientProfile);

/**
 * ✅ STAFF ROUTES ONLY (everything below requires staff token)
 */
router.use(requireAuth);

// Staff list + CRUD
router.get("/", listPatients);
router.post("/", authorizeRoles("Admin", "CaseManager"), createPatient);
router.get("/:mrn", getPatient);
router.put("/:mrn", authorizeRoles("Admin", "CaseManager"), updatePatient);
router.delete("/:mrn", authorizeRoles("Admin"), removePatient);

// Bulk delete (Admin only)
router.delete("/", authorizeRoles("Admin"), deleteAllPatients);

export default router;
