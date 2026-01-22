import mongoose from "mongoose";
import Counter from "./counter.model.js";

function formatShiftCode(n) {
  return `SH-${n.toString().padStart(4, "0")}`; // SH-0001
}

const shiftSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, index: true },

    name: { type: String, trim: true }, // Morning / Evening / Night
    startTime: { type: String, required: true }, // "08:00"
    endTime: { type: String, required: true },   // "16:00"
    isActive: { type: Boolean, default: true },

    staff: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["Nurse", "CaseManager", "Biller"], required: true },
      },
    ],
  },
  { timestamps: true }
);

shiftSchema.pre("save", async function (next) {
  if (this.code) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "shift_code" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.code = formatShiftCode(counter.seq);
    next();
  } catch (e) {
    next(e);
  }
});

export default mongoose.model("Shift", shiftSchema);
