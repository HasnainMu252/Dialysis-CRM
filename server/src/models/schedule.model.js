// models/schedule.model.js
import mongoose from "mongoose";
import Counter from "./counter.model.js"; // <-- same pattern as patient.model

export const ScheduleStatus = ["Scheduled", "InProgress", "Completed", "Cancelled"];

// Helper to format human readable schedule code
function formatScheduleCode(n) {
  return `SC-${n.toString().padStart(6, "0")}`; // e.g. SC-000001
}

const scheduleSchema = new mongoose.Schema(
  {
    // Human readable schedule code, used in URLs
    code: {
      type: String,
      unique: true,
      index: true,
    },

    patientMrn: {
      type: String,
      ref: "Patient",
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    bedCode: {
      type: String,
      required: true,
    },

    bed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ScheduleStatus,
      default: "Scheduled",
    },

    cancel: {
      requested: { type: Boolean, default: false },
      approved: { type: Boolean, default: false },
      reason: { type: String },
    },
    startAt: { type: Date, required: true },  // exact DateTime in UTC
endAt: { type: Date, required: true },    // exact DateTime in UTC

state: {
  type: String,
  enum: ["Scheduled", "CheckedIn", "InProgress", "Completed", "Cancelled", "NoShow", "Maintenance"],
  default: "Scheduled",
},

durationHours: { type: Number, default: 4 }, // 3 / 3.5 / 4
actualStartAt: { type: Date, default: null },
actualEndAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// 🔹 Unique index to avoid exact duplicate bookings for same bedCode + date + time
scheduleSchema.index(
  { bedCode: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

// 🔹 Auto-generate human readable schedule code SC-000001
scheduleSchema.pre("save", async function (next) {
  if (this.code) return next(); // already set

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "schedule_code" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.code = formatScheduleCode(counter.seq);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔹 Virtual alias, for convenience: scheduleId === code
scheduleSchema.virtual("scheduleId").get(function () {
  return this.code || null;
});

// 🔹 Include virtuals (like scheduleId) in JSON & Object output
scheduleSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

scheduleSchema.set("toObject", {
  virtuals: true,
});

export default mongoose.model("Schedule", scheduleSchema);
