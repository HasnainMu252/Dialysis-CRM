import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referredBy: String,
    contact: String,
    patientName: String,
    notes: String,
    status: { type: String, enum: ["New", "Contacted", "Converted", "Closed"], default: "New" }
  },
  { timestamps: true }
);

export default mongoose.model("Referral", referralSchema);
