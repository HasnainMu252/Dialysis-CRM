import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Counter from "./counter.model.js";

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

function formatMRN(number) {
  return `MRN-${number.toString().padStart(6, "0")}`;
}

const patientSchema = new mongoose.Schema(
  {
    mrn: { type: String, unique: true }, // auto-generated MRN
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 }, // new password field
    address: { type: String, required: true },
    insurance: {
      provider: { type: String },
      memberId: { type: String },
      groupNumber: { type: String },
    },
    dialysis: dialysisSchema,
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// Auto-generate MRN
patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Hash password before saving if it's new or updated
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
patientSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Patient", patientSchema);
