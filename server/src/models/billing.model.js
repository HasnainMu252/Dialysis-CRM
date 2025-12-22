import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
  {
    // Auto increment-like numeric id (optional)
    billingId: { type: Number, index: true },

    // Unique readable code like: BILL-000001
    code: { type: String, required: true, unique: true, index: true },

    patientMrn: { type: String, required: true, index: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },

    scheduleCode: { type: String, required: true, index: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },

    amount: { type: Number, required: true, min: 0 },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash", "Card", "Bank", "Online", "Other"],
      default: "Cash",
    },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled", "Refunded"],
      default: "Pending",
      index: true,
    },

    paidAt: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Generate billingId + code automatically if not provided
billingSchema.pre("validate", async function (next) {
  try {
    if (this.code && this.billingId) return next();

    // If you want a simple "sequence" without a separate counters collection:
    // we derive next id from latest billingId (works fine for small apps; for heavy concurrency use counters)
    const last = await mongoose.model("Billing").findOne({}, { billingId: 1 }).sort({ billingId: -1 }).lean();

    const nextId = (last?.billingId || 0) + 1;
    this.billingId = this.billingId ?? nextId;

    // Code format: BILL-000001
    this.code = this.code ?? `BILL-${String(nextId).padStart(6, "0")}`;

    next();
  } catch (err) {
    next(err);
  }
});

const Billing = mongoose.model("Billing", billingSchema);
export default Billing;
