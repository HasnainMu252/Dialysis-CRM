import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", authorizeRoles("Admin"), getSettings);
router.patch("/", authorizeRoles("Admin"), updateSettings);

export default router;
