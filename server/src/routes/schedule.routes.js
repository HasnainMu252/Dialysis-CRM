import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  deleteAllSchedules
} from "../controllers/schedule.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", getSchedules);
router.get("/:id", getSchedule);
router.post("/", authorizeRoles("Admin", "CaseManager"), createSchedule);
router.put("/:id", authorizeRoles("Admin", "CaseManager", "Nurse"), updateSchedule);
router.delete("/:id", authorizeRoles("Admin"), deleteSchedule);

router.delete("/", requireAuth, authorizeRoles("Admin"), deleteAllSchedules);

export default router;
