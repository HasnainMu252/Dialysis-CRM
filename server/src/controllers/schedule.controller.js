import Schedule from "../models/schedule.model.js";
import { setTimeout as wait } from "timers/promises";
import Bed from "../models/bed.model.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMin = (t)=>{ const [H,M]=t.split(":").map(Number); return H*60+M; };
const buildUTCDate = (yyyyMmDd) => {
  const [y,m,d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m-1, d, 0,0,0,0));
  return Number.isNaN(dt.getTime()) ? null : dt;
};

export const createSchedule = async (req, res) => {
  try {
    const { patient, bed, nurse, date, startTime, endTime } = req.body;

    // Validate basics
    if (!DATE_RE.test(date))    return res.status(400).json({ message: "date must be YYYY-MM-DD" });
    if (!TIME_RE.test(startTime)||!TIME_RE.test(endTime)) return res.status(400).json({ message: "time must be HH:mm" });

    const scheduleDate = buildUTCDate(date);
    if (!scheduleDate) return res.status(400).json({ message: "Invalid date" });

    const start = toMin(startTime), end = toMin(endTime);
    if (start >= end) return res.status(400).json({ message: "startTime must be < endTime" });

    // Past check (date + time today)
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    if (scheduleDate < todayUTC) return res.status(400).json({ message: "Cannot schedule in the past date" });
    if (scheduleDate.getTime() === todayUTC.getTime()) {
      const startMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), Math.floor(start/60), start%60, 0);
      if (startMs <= now.getTime()) return res.status(400).json({ message: "Cannot schedule a past time today" });
    }

    // Bed must exist
    const bedDoc = await Bed.findById(bed);
    if (!bedDoc) return res.status(400).json({ message: "Bed not found" });
    if (bedDoc.status === "UnderMaintenance") {
      return res.status(400).json({ message: `Bed ${bedDoc.name} is under maintenance` });
    }

    // Overlap rules with 30m post-maintenance on existing sessions
    const existing = await Schedule.find({ date: scheduleDate, bed });
    const requestedStart = start, requestedEndWithMaint = end + 30;

    const clashBed = existing.some(s=>{
      const sS = toMin(s.startTime);
      const sEWithMaint = toMin(s.endTime) + 30; // existing session holds bed +30m
      return !(requestedEndWithMaint <= sS || requestedStart >= sEWithMaint);
    });
    if (clashBed) {
      return res.status(400).json({ message: `Bed ${bedDoc.name} is busy or in maintenance window for that time.` });
    }

    // Patient can't overlap own sessions
    const samePatient = await Schedule.findOne({
      patient, date: scheduleDate,
      $and: [{ startTime: { $lte: endTime } }, { endTime: { $gte: startTime } }]
    });
    if (samePatient) {
      return res.status(400).json({ message: "Patient already has a session in this time window." });
    }

    // Nurse cannot overlap
    if (nurse) {
      const sameNurse = await Schedule.findOne({
        nurse, date: scheduleDate,
        $and: [{ startTime: { $lte: endTime } }, { endTime: { $gte: startTime } }]
      });
      if (sameNurse) return res.status(400).json({ message: "Nurse is already assigned in this window." });
    }

    // Create schedule
    const schedule = await Schedule.create({
      patient, bed, nurse, date: scheduleDate, startTime, endTime
    });

    // Optionally mark bed Busy immediately (bed status is informational; conflicts are enforced by queries above)
    await Bed.findByIdAndUpdate(bed, { status: "Busy" }, { new: true });

    res.status(201).json({ message: "✅ Schedule created successfully.", schedule });
  } catch (err) {
    console.error("createSchedule error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getSchedules = async (req, res) => {
  const schedules = await Schedule.find()
    .populate("patient", "firstName lastName mrn")
    .populate("nurse", "name role");
  res.json(schedules);
};

export const getSchedule = async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate("patient")
    .populate("nurse");
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  res.json(schedule);
};


export const updateSchedule = async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });

  // If nurse set status=Completed, maintain bed for +30 min then free it
  if (req.body.status === "Completed") {
    const now = new Date();
    const endMins = toMin(schedule.endTime);
    const endMs = Date.UTC(
      schedule.date.getUTCFullYear(),
      schedule.date.getUTCMonth(),
      schedule.date.getUTCDate(),
      Math.floor(endMins/60),
      endMins%60,
      0,0
    );
    const releaseAt = endMs + 30*60*1000; // +30m
    const delay = Math.max(0, releaseAt - now.getTime());

    // Mark bed Busy during maintenance window
    await Bed.findByIdAndUpdate(schedule.bed, { status: "Busy" });

    // async release
    (async ()=>{
      await wait(delay);
      await Bed.findByIdAndUpdate(schedule.bed, { status: "Available" });
    })();
  }

  res.json(schedule);
};

export const deleteSchedule = async (req, res) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  res.json({ message: "Deleted" });
};


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

export const approveCancel = async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    { "cancel.approved": true },
    { new: true }
  );
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  // free the bed immediately
  await Bed.findByIdAndUpdate(schedule.bed, { status: "Available" });
  res.json({ message: "Cancellation approved", schedule });
};



