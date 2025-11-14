import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    encounterDate: { type: Date, required: true },
    cptCodes: [{ code: String, amount: Number }],
    payer: String,
    total: Number,
    status: { type: String, enum: ["Pending", "Paid", "Unpaid"], default: "Unpaid" },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Billing", billingSchema);
