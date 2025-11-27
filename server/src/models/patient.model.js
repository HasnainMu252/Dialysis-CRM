import mongoose from "mongoose";
import Counter from "./counter.model.js";   // import counter model

const dialysisSchema = new mongoose.Schema({
  modality: {
    type: String,
    enum: ["HD", "PD"],
    required: true,
  },
  shift: {
    type: String,
    enum: ["Morning", "Evening"],
    required: true,
  },
  scheduleDays: {
    type: [String],
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    required: true,
  },
});

// ====== HELPER FUNCTION ======
function formatMRN(number) {
  return `MRN-${number.toString().padStart(6, "0")}`;
}

// ====== PATIENT SCHEMA ======
const patientSchema = new mongoose.Schema(
  {
    mrn: { type: String, unique: true },   // REMOVE required:true
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    insurance: {
      provider: { type: String },
      memberId: { type: String },
      groupNumber: { type: String },
    },
    dialysis: dialysisSchema,
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);



// ✅ AUTO-GENERATE MRN BEFORE SAVE
patientSchema.pre("save", async function (next) {
  if (this.mrn) return next();  // already exists, skip

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "patient_mrn" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.mrn = formatMRN(counter.seq);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Patient", patientSchema);
