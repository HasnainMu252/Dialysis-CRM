import mongoose from "mongoose";
import { mongooseDateTransform } from "../../../client/src/utils/mongooseTransform.js";

export const ScheduleStatus = ["Scheduled", "InProgress", "Completed", "Cancelled"];

const formattedDate = new Date("2025-10-11T00:00:00.000Z").toLocaleDateString('en-GB');
{
  console.log(formattedDate)
}
const scheduleSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  bed:     { type: mongoose.Schema.Types.ObjectId, ref: "Bed", required: true },
  date:    { type: formattedDate, required: true },
  
  startTime: { type: String, required: true },
  endTime:   { type: String, required: true },
  status:  { type: String, enum: ScheduleStatus, default: "Scheduled" },
  cancel: {
    requested: { type: Boolean, default: false },
    approved:  { type: Boolean, default: false },
    reason:    { type: String }
  }
}, { timestamps: true },mongooseDateTransform);


scheduleSchema.index({ bed: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

export default mongoose.model("Schedule", scheduleSchema,mongooseDateTransform);
