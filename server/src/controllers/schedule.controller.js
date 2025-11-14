import Schedule from "../models/schedule.model.js";
import { setTimeout as wait } from "timers/promises";
import Bed from "../models/bed.model.js";

// Regex for date and time validation
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Helper functions
const toMin = (t) => {
  const [H, M] = t.split(":").map(Number);
  return H * 60 + M;
};

const buildUTCDate = (yyyyMmDd) => {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  return Number.isNaN(dt.getTime()) ? null : dt;
};

// Create schedule function
export const createSchedule = async (req, res) => {
  try {
    const { patient, bed, date, startTime, endTime } = req.body;

    if (!patient || !bed || !date || !startTime || !endTime)
      return res.status(400).json({ message: "Missing required fields" });

    // Validate date and time format
    if (!DATE_RE.test(date) || !TIME_RE.test(startTime) || !TIME_RE.test(endTime))
      return res.status(400).json({ message: "Invalid date/time format" });

    // Build the schedule date
    const [y, m, d] = date.split("-").map(Number);
    const scheduleDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));

    const start = toMin(startTime);
    const end = toMin(endTime);

    if (start >= end)
      return res.status(400).json({ message: "startTime must be before endTime" });

    // 🧩 Bed must exist and not under maintenance
    const bedDoc = await Bed.findById(bed);
    if (!bedDoc) return res.status(404).json({ message: "Bed not found" });
    if (bedDoc.status === "UnderMaintenance")
      return res.status(400).json({ message: `Bed ${bedDoc.name} is under maintenance` });

    // 🧩 Prevent overlap
    const overlap = await Schedule.findOne({
      bed,
      date: scheduleDate,
      $and: [{ startTime: { $lt: endTime } }, { endTime: { $gt: startTime } }]
    });

    if (overlap)
      return res.status(400).json({ message: `Bed ${bedDoc.name} already booked for that time.` });

    // 🧩 Check if today, update the bed status if necessary
    const today = new Date();
    if (scheduleDate.toDateString() === today.toDateString()) {
      await Bed.findByIdAndUpdate(bed, { status: "Busy" });
    }

    // ✅ Create the schedule
    const schedule = await Schedule.create({
      patient,
      bed,
      date: scheduleDate,
      startTime,
      endTime
    });

    // Mark the bed as busy
    await Bed.findByIdAndUpdate(bed, { status: "Busy" });

    res.status(201).json({ message: "✅ Schedule created successfully.", schedule });
  } catch (err) {
    console.error("createSchedule error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all schedules
export const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("patient", "firstName lastName mrn")
      .populate("bed", "name status")
      .sort({ date: 1, startTime: 1 });

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get a specific schedule by ID
export const getSchedule = async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate("patient")
    .populate("nurse");

  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  res.json(schedule);
};

// Update schedule details
export const updateSchedule = async (req, res) => {
  try {
    const allowedForNurse = ["status", "cancel"];
    const updates = req.body;

    // Role-based field filter for nurse
    if (req.user.role === "Nurse") {
      Object.keys(updates).forEach(key => {
        if (!allowedForNurse.includes(key)) delete updates[key];
      });
    }

    const schedule = await Schedule.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("patient", "firstName lastName mrn")
      .populate("bed", "name status");

    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    res.json({ message: "✅ Schedule updated.", schedule });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete schedule by ID
export const deleteSchedule = async (req, res) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  res.json({ message: "Deleted" });
};

// Delete all schedules with confirmation
export const deleteAllSchedules = async (req, res) => {
  try {
    if (req.query.confirm !== "true") {
      return res.status(400).json({
        message: "Dangerous operation blocked. Add ?confirm=true to delete ALL schedules."
      });
    }

    const result = await Schedule.deleteMany({});
    return res.json({
      message: "🗑️ All schedule records deleted successfully.",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("❌ Error deleting all schedules:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Request cancel schedule
export const requestCancel = async (req, res) => {
  const { reason } = req.body || {};
  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    { status: "Cancelled", "cancel.requested": true, "cancel.reason": reason || "N/A" },
    { new: true }
  );
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  res.json({ message: "Cancellation requested", schedule });
};

// Approve cancel schedule and free the bed
export const approveCancel = async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    { "cancel.approved": true },
    { new: true }
  );
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  // Free the bed immediately
  await Bed.findByIdAndUpdate(schedule.bed, { status: "Available" });
  res.json({ message: "Cancellation approved", schedule });
};
