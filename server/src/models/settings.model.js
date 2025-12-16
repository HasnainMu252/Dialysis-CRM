import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    defaultDurationHours: { type: Number, default: 4 },     // 3/3.5/4
    maintenanceMinutes: { type: Number, default: 30 },      // default 30
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
