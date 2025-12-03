// models/schedule.model.js
import mongoose from "mongoose";

export const ScheduleStatus = ["Scheduled", "InProgress", "Completed", "Cancelled"];

const scheduleSchema = new mongoose.Schema(
  {
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
      required: true 
    },

    bed: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Bed", 
      required: true 
    },

    date: {
      type: Date,
      required: true
    },

    startTime: {
      type: String,
      required: true
    },

    endTime: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ScheduleStatus,
      default: "Scheduled"
    },

    cancel: {
      requested: { type: Boolean, default: false },
      approved: { type: Boolean, default: false },
      reason: { type: String },
    },
  },
  { 
    timestamps: true
  }
);

// 🔹 Unique index to avoid exact duplicate bookings for same bedCode + date + time
scheduleSchema.index(
  { bedCode: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

// 🔹 Human-readable virtual ID, e.g. "SC-6BF2"
scheduleSchema.virtual("scheduleId").get(function () {
  if (!this._id) return null;
  const short = this._id.toString().slice(-4).toUpperCase();
  return `SC-${short}`;
});

// 🔹 Include virtuals (like scheduleId) in JSON & Object output
scheduleSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    // Hide internal stuff if you want:
    delete ret.__v;
    return ret;
  }
});

scheduleSchema.set("toObject", {
  virtuals: true
});

export default mongoose.model("Schedule", scheduleSchema);
