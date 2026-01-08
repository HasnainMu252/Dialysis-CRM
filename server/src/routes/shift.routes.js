import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import {
  createShift,
  listShifts,
  getShift,
  updateShift,
  assignStaff,
  removeStaff,
  todayWorkload,
  deleteShift,
} from "../controllers/shift.controller.js";

const router = Router();
router.use(requireAuth);

// Admin only
router.post("/", authorizeRoles("Admin"), createShift);
router.patch("/:code", authorizeRoles("Admin"), updateShift);
router.post("/:code/staff", authorizeRoles("Admin"), assignStaff);
router.delete("/:code/staff/:userId", authorizeRoles("Admin"), removeStaff);

// Admin can view
router.get("/", authorizeRoles("Admin"), listShifts);
router.get("/workload/today", authorizeRoles("Admin"), todayWorkload);
router.get("/:code", authorizeRoles("Admin"), getShift);
router.delete("/:code", authorizeRoles("Admin"), deleteShift); // ✅ DELETE

export default router;
