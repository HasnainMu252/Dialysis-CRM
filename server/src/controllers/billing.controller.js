import Billing from "../models/billing.model.js";
import Patient from "../models/patient.model.js";
import Schedule from "../models/schedule.model.js";

const formatBilling = (doc) => {
  const b = doc.toJSON ? doc.toJSON() : doc;
  return {
    billingId: b.billingId,
    billingCode: b.code,
    id: b._id,

    patientMrn: b.patientMrn,
    patientName: b.patient ? `${b.patient.firstName} ${b.patient.lastName}`.trim() : undefined,

    scheduleCode: b.scheduleCode,

    amount: b.amount,
    paymentMethod: b.paymentMethod,
    status: b.status,
    paidAt: b.paidAt,
    notes: b.notes,

    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
};

// POST /api/billing
export const createBilling = async (req, res) => {
  try {
    const { patientMrn, scheduleCode, amount, paymentMethod, notes } = req.body;

    if (!patientMrn || !scheduleCode || amount == null || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: patientMrn, scheduleCode, amount, paymentMethod",
      });
    }

    const patient = await Patient.findOne({ mrn: patientMrn });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    const schedule = await Schedule.findOne({ code: scheduleCode });
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    const bill = await Billing.create({
      patientMrn,
      patient: patient._id,
      scheduleCode,
      schedule: schedule._id,
      amount: Number(amount),
      paymentMethod,
      notes: notes || "",
      status: "Pending",
    });

    const populated = await Billing.findById(bill._id).populate("patient", "firstName lastName mrn");
    return res.status(201).json({ success: true, message: "Billing created", billing: formatBilling(populated) });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
};

// GET /api/billing?patientMrn=&status=&from=&to=
export const listBilling = async (req, res) => {
  try {
    const { patientMrn, status, from, to } = req.query;
    const filter = {};

    if (patientMrn) filter.patientMrn = patientMrn;
    if (status) filter.status = status;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const bills = await Billing.find(filter)
      .populate("patient", "firstName lastName mrn")
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json({ success: true, count: bills.length, billings: bills.map(formatBilling) });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
};

// GET /api/billing/:code
export const getBilling = async (req, res) => {
  try {
    const b = await Billing.findOne({ code: req.params.code }).populate("patient", "firstName lastName mrn");
    if (!b) return res.status(404).json({ success: false, message: "Billing not found" });
    return res.json({ success: true, billing: formatBilling(b) });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
};

// PATCH /api/billing/:code (update amount/method/notes/status)
export const updateBilling = async (req, res) => {
  try {
    const updates = { ...req.body };

    // If status becomes Paid, set paidAt automatically
    if (updates.status === "Paid") updates.paidAt = new Date();

    const b = await Billing.findOneAndUpdate({ code: req.params.code }, updates, {
      new: true,
      runValidators: true,
    }).populate("patient", "firstName lastName mrn");

    if (!b) return res.status(404).json({ success: false, message: "Billing not found" });

    return res.json({ success: true, message: "Billing updated", billing: formatBilling(b) });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
};

// DELETE /api/billing/:code (Admin only)
export const deleteBilling = async (req, res) => {
  try {
    const b = await Billing.findOneAndDelete({ code: req.params.code });
    if (!b) return res.status(404).json({ success: false, message: "Billing not found" });
    return res.json({ success: true, message: "Billing deleted" });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
};
