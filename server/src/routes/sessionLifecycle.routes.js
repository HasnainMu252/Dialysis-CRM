import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import { checkIn, startSession, completeSession, markNoShow } from "../controllers/sessionLifecycle.controller.js";

const router = Router();
router.use(requireAuth);

router.patch("/:code/checkin", authorizeRoles("Admin","Nurse","CaseManager"), checkIn);
router.patch("/:code/start", authorizeRoles("Admin","Nurse"), startSession);
router.patch("/:code/complete", authorizeRoles("Admin","Nurse"), completeSession);
router.patch("/:code/noshow", authorizeRoles("Admin","Nurse"), markNoShow);

export default router;
