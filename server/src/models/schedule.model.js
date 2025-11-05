import mongoose from "mongoose";

export const ScheduleStatus = ["Scheduled","InProgress","Completed","Cancelled"];

const scheduleSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  bed:     { type: mongoose.Schema.Types.ObjectId, ref: "Bed", required: true }, // <— NEW
  date:    { type: Date, required: true },      // stored as UTC midnight for that day
  startTime: { type: String, required: true },  // "HH:mm"
  endTime:   { type: String, required: true },  // "HH:mm"
  nurse:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status:  { type: String, enum: ScheduleStatus, default: "Scheduled" },
  cancel: {
    requested: { type: Boolean, default: false },      // nurse requests
    approved:  { type: Boolean, default: false },      // admin/case approves
    reason:    { type: String }
  }
}, { timestamps: true });

// Prevent exact duplicates on same bed + time slot (still keep controller checks for overlaps)
scheduleSchema.index({ bed: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

export default mongoose.model("Schedule", scheduleSchema);
