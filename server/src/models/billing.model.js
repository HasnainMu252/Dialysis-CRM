// models/billing.model.js
import mongoose from "mongoose";
import Counter from "./counter.model.js";

export const BillingStatus = ["Pending", "Paid", "Cancelled", "Refunded"];
export const PaymentMethods = ["Cash", "Card", "Bank", "Online"];

function formatBillingCode(n) {
  return `BL-${n.toString().padStart(6, "0")}`; // BL-000001
}

const billingSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, index: true },

    patientMrn: { type: String, required: true, index: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },

    scheduleCode: { type: String, required: true, index: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },

    amount: { type: Number, required: true, min: 0 },

    paymentMethod: { type: String, enum: PaymentMethods, required: true },

    status: { type: String, enum: BillingStatus, default: "Pending" },
    paidAt: { type: Date, default: null },

    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

billingSchema.pre("save", async function (next) {
  if (this.code) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "billing_code" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.code = formatBillingCode(counter.seq);
    next();
  } catch (e) {
    next(e);
  }
});

billingSchema.virtual("billingId").get(function () {
  return this.code || null;
});

billingSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Billing", billingSchema);
