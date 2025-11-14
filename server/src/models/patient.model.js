import mongoose from "mongoose";

const dialysisSchema = new mongoose.Schema({
  modality: {
    type: String,
    enum: ["HD", "PD"], // "HD" and "PD" as the valid enum values
    required: true,
  },
  shift: {
    type: String,
    enum: ["Morning", "Evening"], // "Morning" and "Evening" as valid shift values
    required: true,
  },
  scheduleDays: {
    type: [String],
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    required: true,
  },
});

const patientSchema = new mongoose.Schema(
  {
    mrn: { type: String, required: true, unique: true },
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

export default mongoose.model("Patient", patientSchema);
