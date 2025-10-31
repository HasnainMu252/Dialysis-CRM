import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    mrn: { type: String, required: true, unique: true }, // medical record number
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["M", "F", "Other"] },
    phone: String,
    email: String,
    address: String,
    insurance: {
      provider: String,
      memberId: String,
      groupNumber: String
    },
    dialysis: {
      modality: { type: String, enum: ["HD", "PD"], default: "HD" },
      scheduleDays: [{ type: String, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }],
      shift: { type: String, enum: ["Morning", "Afternoon", "Evening"] }
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
