// models/bed.model.js
import mongoose from "mongoose";
import Counter from "./counter.model.js"; // same Counter used in patient MRN

export const BedStatus = ["Available", "Busy", "UnderMaintenance"];
export const BedType = ["Standard", "ICU", "Isolation", "Pediatric"];

// helper to format bed code e.g. BED-000001
function formatBedCode(number) {
  return `BED-${number.toString().padStart(6, "0")}`;
}

const bedSchema = new mongoose.Schema(
  {
    // Unique human-friendly code (main external ID)
    code: {
      type: String,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    type: {
      type: String,
      enum: BedType,
      default: "Standard",
    },

    status: {
      type: String,
      enum: BedStatus,
      default: "Available",
    },

    location: {
      ward: { type: String, default: "General" },
      room: { type: String },
      floor: { type: String },
    },

    capacity: {
      type: Number,
      default: 1,
      min: 1,
    },

    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// ✅ Auto-generate bedCode before save (like MRN)
bedSchema.pre("save", async function (next) {
  if (this.code) return next(); // already has a code

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "bed_code" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.code = formatBedCode(counter.seq);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Bed", bedSchema);
