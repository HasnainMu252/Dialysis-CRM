// src/controllers/schedule.controller.js
import Schedule from "../models/schedule.model.js";
import Patient from "../models/patient.model.js";
import Bed from "../models/bed.model.js";

// Regex for date and time validation
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Helper function – convert "HH:MM" to minutes
const toMin = (t) => {
  const [H, M] = t.split(":").map(Number);
  return H * 60 + M;
};

// 🔹 Format schedule object for clean API response
const formatSchedule = (doc) => {
  if (!doc) return null;
  const s = doc.toJSON ? doc.toJSON() : doc;

  const fullName =
    s.patient && (s.patient.firstName || s.patient.lastName)
      ? `${s.patient.firstName || ""} ${s.patient.lastName || ""}`.trim()
      : undefined;

  return {
    // Human readable + internal ids
    scheduleId: s.scheduleId, // alias for code
    scheduleCode: s.code,
    id: s._id, // internal Mongo _id (optional for frontend)

    // Patient summary
    patientMrn: s.patientMrn,
    patientName: fullName,
    patientPhone: s.patient?.phone,

    // Bed summary
    bedCode: s.bedCode,
    bedName: s.bed?.name,
    bedType: s.bed?.type,
    bedStatus: s.bed?.status,

    // Core schedule info
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
    cancel: s.cancel,

    createdAt: s.createdAt,
    updatedAt: s.updatedAt,

    // Full populated objects (if frontend needs details)
    patient: s.patient,
    bed: s.bed,
  };
};

export const createSchedule = async (req, res) => {
  try {
    const { patientMrn, bedCode, date, startTime, endTime, status } = req.body;

    // 1) Required fields
    if (!patientMrn || !bedCode || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: patientMrn, bedCode, date, startTime, endTime",
      });
    }

    // 2) Validate date/time format
    if (!DATE_RE.test(date) || !TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date/time format. Date: YYYY-MM-DD, Time: HH:MM",
      });
    }

    // 3) Time order check
    const startMin = toMin(startTime);
    const endMin = toMin(endTime);
    if (startMin >= endMin) {
      return res.status(400).json({
        success: false,
        message: "startTime must be before endTime",
      });
    }

    // ✅ Helper: build UTC datetime from date + time
    const buildUtcDateTime = (dateStr, timeStr) => {
      const [y, m, d] = dateStr.split("-").map(Number);
      const [hh, mm] = timeStr.split(":").map(Number);
      return new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
    };

    // ✅ Date-only (00:00 UTC) for filtering + reports
    const [y, m, d] = date.split("-").map(Number);
    const dateOnlyUTC = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));

    const startAt = buildUtcDateTime(date, startTime);
    const endAt = buildUtcDateTime(date, endTime);

    // 4) Past check (important)
    if (startAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot create schedule in the past.",
      });
    }

    // 5) Find patient by MRN
    const patient = await Patient.findOne({ mrn: patientMrn });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found with the provided MRN",
      });
    }

    // 6) Find bed by bedCode
    const bedDoc = await Bed.findOne({ code: bedCode });
    if (!bedDoc) {
      return res.status(404).json({
        success: false,
        message: "Bed not found for the provided bedCode",
      });
    }

    // ✅ If bed under maintenance, block scheduling
    if (bedDoc.status === "UnderMaintenance") {
      return res.status(400).json({
        success: false,
        message: `Bed ${bedDoc.name} is under maintenance`,
      });
    }

    // ✅ If you add maintenanceUntil in Bed, block scheduling until released
    if (bedDoc.maintenanceUntil && bedDoc.maintenanceUntil > startAt) {
      return res.status(400).json({
        success: false,
        message: `Bed ${bedDoc.name} is under maintenance until ${bedDoc.maintenanceUntil.toISOString()}`,
      });
    }

    // 7) ✅ Prevent overlap using startAt/endAt (correct way)
    const overlap = await Schedule.findOne({
      bed: bedDoc._id,
      state: { $in: ["Scheduled", "CheckedIn", "InProgress"] }, // active sessions
      startAt: { $lt: endAt },
      endAt: { $gt: startAt },
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: `Bed ${bedDoc.name} is already booked for that time.`,
      });
    }

    // 8) Create schedule
    const durationHours = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60);

    const schedule = await Schedule.create({
      patientMrn,
      patient: patient._id,
      bedCode,
      bed: bedDoc._id,

      date: dateOnlyUTC,      // ✅ date-only for filters
      startTime,
      endTime,

      startAt,                // ✅ datetime accurate
      endAt,                  // ✅ datetime accurate
      durationHours,

      state: "Scheduled",
      status: status || "Scheduled",
    });

    // 9) Populate and return formatted
    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate({ path: "patient", select: "firstName lastName mrn phone", strictPopulate: false })
      .populate({ path: "bed", select: "code name status type", strictPopulate: false });

    return res.status(201).json({
      success: true,
      message: "✅ Schedule created successfully.",
      schedule: formatSchedule(populatedSchedule),
    });
  } catch (err) {
    console.error("createSchedule error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate schedule detected (bed already booked).",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};








/**
 * GET ALL SCHEDULES WITH FILTERS
 * Query: patientMrn, date, status, bed (ObjectId), bedCode
 */
export const getSchedules = async (req, res) => {
  try {
    const { patientMrn, date, status, bed, bedCode } = req.query;
    const filter = {};

    if (patientMrn) filter.patientMrn = patientMrn;

    if (date) {
      if (!DATE_RE.test(date)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }
      const [y, m, d] = date.split("-").map(Number);
      filter.date = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    }

    if (status) filter.status = status;

    // Filter by bed id or bedCode
    if (bed) {
      filter.bed = bed; // expecting Mongo _id
    } else if (bedCode) {
      const bedDoc = await Bed.findOne({ code: bedCode });
      if (bedDoc) filter.bed = bedDoc._id;
      else {
        return res.json({
          success: true,
          count: 0,
          schedules: [],
        });
      }
    }

    const schedules = await Schedule.find(filter)
      .populate({
        path: "patient",
        select: "firstName lastName mrn phone",
        strictPopulate: false,
      })
      .populate({
        path: "bed",
        select: "code name status type",
        strictPopulate: false,
      })
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: schedules.length,
      schedules: schedules.map(formatSchedule),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * GET TODAY'S SCHEDULES
 */
export const getTodaySchedules = async (req, res) => {
  try {


    const now = new Date();
    // Start of today (00:00:00 UTC)
    const startOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));

    const schedules = await Schedule.find({
      startAt: { $gte: startOfDayUTC, $lte: endOfDayUTC }
    })

      .populate({
        path: "patient",
        select: "firstName lastName mrn phone",
        strictPopulate: false,
      })
      .populate({
        path: "bed",
        select: "code name status type",
        strictPopulate: false,
      })
      .sort({ startTime: 1 });

    res.json({
      success: true,
      date: startOfDayUTC.toISOString().split("T")[0], // Date part only
      count: schedules.length,
      schedules: schedules.map(formatSchedule),
    });
  } catch (err) {
    console.error("getTodaySchedules error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};



/**
 * GET UPCOMING SCHEDULES
 */
export const getUpcomingSchedules = async (req, res) => {
  try {
    const now = new Date();
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
    );

    const schedules = await Schedule.find({
      date: { $gte: todayUTC },
      status: { $in: ["Scheduled", "InProgress"] },
    })
      .populate({
        path: "patient",
        select: "firstName lastName mrn phone",
        strictPopulate: false,
      })
      .populate({
        path: "bed",
        select: "code name status type",
        strictPopulate: false,
      })
      .sort({ date: 1, startTime: 1 })
      .limit(50);

    res.json({
      success: true,
      count: schedules.length,
      schedules: schedules.map(formatSchedule),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * GET SCHEDULES BY PATIENT MRN
 */
export const getSchedulesByPatientMrn = async (req, res) => {
  try {
    const { mrn } = req.params;

    // Verify patient exists
    const patient = await Patient.findOne({ mrn });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const schedules = await Schedule.find({ patientMrn: mrn })
      .populate({
        path: "bed",
        select: "code name status type",
        strictPopulate: false,
      })
      .populate({
        path: "patient",
        select: "firstName lastName mrn phone",
        strictPopulate: false,
      })
      .sort({ date: -1, startTime: 1 });

    res.json({
      success: true,
      patient: {
        mrn: patient.mrn,
        firstName: patient.firstName,
        lastName: patient.lastName,
        phone: patient.phone,
      },
      count: schedules.length,
      schedules: schedules.map(formatSchedule),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * GET SINGLE SCHEDULE BY HUMAN CODE
 * Route: GET /api/schedules/:code
 */
export const getSchedule = async (req, res) => {
  try {
    const { code } = req.params;

    const schedule = await Schedule.findOne({ code })
      .populate({
        path: "patient",
        select: "firstName lastName mrn phone email",
        strictPopulate: false,
      })
      .populate({
        path: "bed",
        select: "code name status type",
        strictPopulate: false,
      });

    if (!schedule)
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });

    res.json({
      success: true,
      schedule: formatSchedule(schedule),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * UPDATE SCHEDULE BY HUMAN CODE
 * Route: PATCH /api/schedules/:code
 */
export const updateSchedule = async (req, res) => {
  try {
    const { code } = req.params;
    const allowedForNurse = ["status", "cancel"];
    const updates = { ...req.body };

    // Role-based field filter for nurse
    if (req.user?.role === "Nurse") {
      Object.keys(updates).forEach((key) => {
        if (!allowedForNurse.includes(key)) delete updates[key];
      });
    }

    // If updating date/time, validate formats & prevent past date
    if (updates.date) {
      if (!DATE_RE.test(updates.date)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }
      const [y, m, d] = updates.date.split("-").map(Number);
      const newDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));

      const now = new Date();
      const todayUTC = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0
        )
      );

      if (newDate < todayUTC) {
        return res.status(400).json({
          success: false,
          message: "Cannot move schedule into the past.",
        });
      }
      updates.date = newDate;
    }

    if (updates.startTime && !TIME_RE.test(updates.startTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid startTime format. Use HH:MM",
      });
    }

    if (updates.endTime && !TIME_RE.test(updates.endTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid endTime format. Use HH:MM",
      });
    }

    // If updating patientMrn, verify the patient exists
    if (updates.patientMrn) {
      const patient = await Patient.findOne({ mrn: updates.patientMrn });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found with the provided MRN",
        });
      }
      updates.patient = patient._id;
    }

    const schedule = await Schedule.findOneAndUpdate(
      { code },
      updates,
      { new: true, runValidators: true }
    )
      .populate({
        path: "patient",
        select: "firstName lastName mrn phone",
        strictPopulate: false,
      })
      .populate({
        path: "bed",
        select: "code name status type",
        strictPopulate: false,
      });

    if (!schedule)
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });

    res.json({
      success: true,
      message: "✅ Schedule updated.",
      schedule: formatSchedule(schedule),
    });
  } catch (err) {
    console.error("updateSchedule error:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Bed is already booked for this date and time (duplicate schedule).",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * DELETE SINGLE SCHEDULE BY HUMAN CODE
 * Route: DELETE /api/schedules/:code
 */
export const deleteSchedule = async (req, res) => {
  try {
    const { code } = req.params;

    const schedule = await Schedule.findOneAndDelete({ code });
    if (!schedule)
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });

    // Free the bed
    if (schedule.bed) {
      await Bed.findByIdAndUpdate(schedule.bed, { status: "Available" });
    }

    res.json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * DELETE ALL SCHEDULES (requires ?confirm=true)
 */
export const deleteAllSchedules = async (req, res) => {
  try {
    if (req.query.confirm !== "true") {
      return res.status(400).json({
        success: false,
        message:
          "Dangerous operation blocked. Add ?confirm=true to delete ALL schedules.",
      });
    }

    const result = await Schedule.deleteMany({});

    // Free all beds
    await Bed.updateMany({}, { status: "Available" });

    return res.json({
      success: true,
      message: "🗑️ All schedule records deleted successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("❌ Error deleting all schedules:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * REQUEST CANCEL BY HUMAN CODE
 * Route: PATCH /api/schedules/:code/cancel
 */
export const requestCancel = async (req, res) => {
  try {
    const { code } = req.params;
    const { reason } = req.body || {};

    const schedule = await Schedule.findOneAndUpdate(
      { code },
      {
        status: "Cancelled",
        "cancel.requested": true,
        "cancel.reason": reason || "No reason provided",
      },
      { new: true }
    )
      .populate({
        path: "bed",
        select: "code name status",
        strictPopulate: false,
      })
      .populate({
        path: "patient",
        select: "firstName lastName mrn phone",
        strictPopulate: false,
      });

    if (!schedule)
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });

    res.json({
      success: true,
      message: "Cancellation requested",
      schedule: formatSchedule(schedule),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * APPROVE CANCEL & FREE BED BY HUMAN CODE
 * Route: PATCH /api/schedules/:code/cancel/approve
 */
export const approveCancel = async (req, res) => {
  try {
    const { code } = req.params;

    const schedule = await Schedule.findOneAndUpdate(
      { code },
      { "cancel.approved": true },
      { new: true }
    )
      .populate({
        path: "bed",
        select: "code name status",
        strictPopulate: false,
      })
      .populate({
        path: "patient",
        select: "firstName lastName mrn phone",
        strictPopulate: false,
      });

    if (!schedule)
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });

    // Free the bed immediately
    if (schedule.bed) {
      await Bed.findByIdAndUpdate(schedule.bed, { status: "Available" });
    }

    res.json({
      success: true,
      message: "Cancellation approved",
      schedule: formatSchedule(schedule),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
