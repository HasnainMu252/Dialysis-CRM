import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g. "08:00"
    endTime: { type: String, required: true },
    station: { type: String }, // chair/machine number
    nurse: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: String,
    status: { type: String, enum: ["Scheduled", "Completed", "Missed", "Cancelled"], default: "Scheduled" }
  },
  { timestamps: true }
);

export default mongoose.model("Schedule", scheduleSchema);
