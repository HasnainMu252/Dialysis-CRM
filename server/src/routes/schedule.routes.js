import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import {
  createSchedule, getSchedules, getSchedule,
  updateSchedule, deleteSchedule,
  deleteAllSchedules, requestCancel, approveCancel
} from "../controllers/schedule.controller.js";

const router = Router();

router.use(requireAuth);

// list/get
router.get("/", getSchedules);
router.get("/:id", getSchedule);

// create (Admin/CaseManager)
router.post("/", authorizeRoles("Admin","CaseManager"), createSchedule);

// update: nurse can update status; Admin/CaseManager too
router.put("/:id", authorizeRoles("Nurse","Admin","CaseManager"), updateSchedule);

// cancel flow
router.put("/:id/request-cancel", authorizeRoles("Nurse","Admin","CaseManager"), requestCancel);
router.put("/:id/approve-cancel", authorizeRoles("Admin","CaseManager"), approveCancel);

// deletes
router.delete("/:id", authorizeRoles("Admin"), deleteSchedule);
router.delete("/", authorizeRoles("Admin"), deleteAllSchedules);

export default router;
