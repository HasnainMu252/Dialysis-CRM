import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Counter from "./counter.model.js";

const dialysisSchema = new mongoose.Schema({
  modality: { type: String, enum: ["HD", "PD"], required: true },
  shift: { type: String, enum: ["Morning", "Evening"], required: true },
  scheduleDays: {
    type: [String],
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    required: true,
  },
});

function formatMRN(number) {
  return `MRN-${number.toString().padStart(6, "0")}`;
}

const patientSchema = new mongoose.Schema(
  {
    mrn: {
      type: String,
      unique: true,
      sparse: true, // ✅ allows multiple docs without mrn (but we will generate it anyway)
      index: true,
    },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },

    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: { type: String, required: true, minlength: 6 },

    address: { type: String, required: true },

    // You said you don't need insurance now — optional:
    // insurance: { provider: String, memberId: String, groupNumber: String },

    dialysis: dialysisSchema,

    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

/**
 * ✅ Generate MRN BEFORE saving (best: pre("validate"))
 * This ensures mrn is never null when inserted.
 */
patientSchema.pre("validate", async function (next) {
  try {
    if (this.mrn) return next();

    const counter = await Counter.findOneAndUpdate(
      { name: "patient_mrn" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.mrn = formatMRN(counter.seq);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * ✅ Hash password only when changed
 */
patientSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * ✅ Compare password
 */
patientSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * ✅ Hide password in JSON responses
 */
patientSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Patient", patientSchema);
