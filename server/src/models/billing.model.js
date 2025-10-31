import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    encounterDate: { type: Date, required: true },
    cptCodes: [{ code: String, amount: Number }],
    dxCodes: [String], // ICD codes
    payer: { type: String },
    status: { type: String, enum: ["Draft", "Submitted", "Paid", "Denied"], default: "Draft" },
    total: Number,
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("Billing", billingSchema);
