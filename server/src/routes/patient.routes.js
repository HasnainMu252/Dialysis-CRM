import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import { createPatient, listPatients, getPatient, updatePatient, removePatient,deleteAllPatients } from "../controllers/patient.controller.js";

const router = Router();

// Nurses, Case Managers, Admins can read; only Admin/CaseManager can create/update/delete (example policy)
router.use(requireAuth);

router.get("/", listPatients);
router.post("/", authorizeRoles("Admin", "CaseManager"), createPatient);
router.get("/:mrn",  getPatient);
router.put("/:mrn", authorizeRoles("Admin", "CaseManager"), updatePatient);
router.delete("/:mrn", authorizeRoles("Admin"), removePatient);



// 🔥 bulk delete (Admin only) with guard
router.delete("/", authorizeRoles("Admin"), deleteAllPatients);



export default router;
