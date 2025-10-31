import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import { createPatient, listPatients, getPatient, updatePatient, removePatient } from "../controllers/patient.controller.js";

const router = Router();

// Nurses, Case Managers, Admins can read; only Admin/CaseManager can create/update/delete (example policy)
router.use(requireAuth);

router.get("/", listPatients);
router.post("/", authorizeRoles("Admin", "CaseManager"), createPatient);
router.get("/:id",  getPatient);
router.put("/:id", authorizeRoles("Admin", "CaseManager"), updatePatient);
router.delete("/:id", authorizeRoles("Admin"), removePatient);

export default router;
