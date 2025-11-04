import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import {
  createReferral,
  getReferrals,
  getReferral,
  updateReferral,
  deleteReferral
} from "../controllers/referral.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", getReferrals);
router.get("/:id", getReferral);
router.post("/", authorizeRoles("CaseManager", "Admin"), createReferral);
router.put("/:id", authorizeRoles("CaseManager", "Admin"), updateReferral);
router.delete("/:id", authorizeRoles("Admin"), deleteReferral);

export default router;
