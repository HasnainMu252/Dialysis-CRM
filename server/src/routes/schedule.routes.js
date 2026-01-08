// routes/schedule.routes.js
import { Router } from "express";
import {
  createSchedule,
  getSchedules,
  getTodaySchedules,
  getUpcomingSchedules,
  getSchedulesByPatientMrn,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  deleteAllSchedules,
  requestCancel,
  approveCancel,
  availability,
  patientRequestSchedule,
  nurseSchedules,
  rejectSchedule,
  approveSchedule,
} from "../controllers/schedule.controller.js";

import { requireAuth, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// ✅ All schedule routes require login
router.use(requireAuth);

/* ================================
   📌 CREATE SCHEDULE
   MRN + bedCode required
   Allowed: Admin, CaseManager, Nurse
================================ */
router.post(
  "/",
  authorizeRoles("Admin", "CaseManager", "Nurse"),
  createSchedule
);

/* ================================
   📌 GET SCHEDULES LIST
   Query Supported:
   - patientMrn
   - date
   - status
   - bed (MongoId)
   - bedCode
================================ */
router.get("/", getSchedules);

/* ================================
   📌 TODAY’S SCHEDULES ONLY
================================ */
router.get("/today", getTodaySchedules);

/* ================================
   📌 UPCOMING SCHEDULES
================================ */
router.get("/upcoming", getUpcomingSchedules);

/* ================================
   📌 GET SCHEDULES BY PATIENT MRN
================================ */
router.get("/patient/:mrn", getSchedulesByPatientMrn);

/* ================================
   📌 GET SINGLE SCHEDULE BY CODE
   Example: /api/schedules/SC-000001
================================ */
router.get("/:code", getSchedule);

/* ================================
   📌 UPDATE SCHEDULE BY CODE
   Allowed: Admin, CaseManager, Nurse
================================ */
router.patch(
  "/:code",
  authorizeRoles("Admin", "CaseManager", "Nurse"),
  updateSchedule
);
// available 

router.get("/availability", requireAuth, availability); 

// patient request routes
router.post("/patient/request", requireAuth, authorizeRoles("Patient"), patientRequestSchedule);

/* ================================
   📌 DELETE SINGLE SCHEDULE BY CODE
   Allowed: Admin only
================================ */
router.delete(
  "/:code",
  authorizeRoles("Admin"),
  deleteSchedule
);

/* ================================
   ⚠️ DELETE ALL SCHEDULES
   Use: /api/schedules?confirm=true
   Allowed: Admin only
================================ */
router.delete(
  "/",
  authorizeRoles("Admin"),
  deleteAllSchedules
);

/* ================================
   📌 REQUEST CANCEL BY CODE
   Allowed: Admin, CaseManager, Nurse
================================ */
router.patch(
  "/:code/cancel",
  authorizeRoles("Admin", "CaseManager", "Nurse"),
  requestCancel
);

/* ================================
   📌 APPROVE CANCEL REQUEST BY CODE
   Allowed: Admin, CaseManager
================================ */
router.patch(
  "/:code/cancel/approve",
  authorizeRoles("Admin", "CaseManager"),
  approveCancel
);

// for approval of schedule reeject and accept by admin/manger
router.patch("/:code/approve", requireAuth, authorizeRoles("Admin","CaseManager"), approveSchedule);
router.patch("/:code/reject", requireAuth, authorizeRoles("Admin","CaseManager"), rejectSchedule);

// Assigned shift patients + lifecycle actions
router.get("/nurse/my", requireAuth, authorizeRoles("Nurse"), nurseSchedules);

export default router;
