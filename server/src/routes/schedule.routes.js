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
  approveCancel
} from "../controllers/schedule.controller.js";

const router = Router();

/* ================================
   📌 CREATE SCHEDULE
   MRN + bedCode required
================================ */
router.post("/", createSchedule);

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
   📌 GET SINGLE SCHEDULE BY ID
================================ */
router.get("/:id", getSchedule);

/* ================================
   📌 UPDATE SCHEDULE BY ID
================================ */
router.patch("/:id", updateSchedule);

/* ================================
   📌 DELETE SINGLE SCHEDULE
================================ */
router.delete("/:id", deleteSchedule);

/* ================================
   ⚠️ DELETE ALL SCHEDULES
   Use: /api/schedules?confirm=true
================================ */
router.delete("/", deleteAllSchedules);

/* ================================
   📌 REQUEST CANCEL
================================ */
router.patch("/:id/cancel", requestCancel);

/* ================================
   📌 APPROVE CANCEL REQUEST
================================ */
router.patch("/:id/cancel/approve", approveCancel);

export default router;
