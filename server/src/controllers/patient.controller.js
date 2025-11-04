import Patient from "../models/patient.model.js";
import mongoose from "mongoose";

import Schedule from "../models/schedule.model.js";
import Billing from "../models/billing.model.js";

export const createPatient = async (req, res) => {
  const patient = await Patient.create(req.body);
  if(!patient){
    return res.status(400).json({
      success:false,
      message:"please Fill the form"
    })
  }else{

    res.status(201).json(patient);
  }
};

export const listPatients = async (req, res) => {
  const q = req.query.q;
  const filter = q
    ? { $or: [{ firstName: new RegExp(q, "i") }, { lastName: new RegExp(q, "i") }, { mrn: new RegExp(q, "i") }] }
    : {};
  const patients = await Patient.find(filter).sort("-createdAt").limit(50);
  res.json(patients);
};

export const getPatient = async (req, res) => {
  const p = await Patient.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
};

export const updatePatient = async (req, res) => {
  const p = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
};

export const removePatient = async (req, res) => {
  const p = await Patient.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};

// for use for deletion of paitent data from data base using admin Auth and True  
export const deleteAllPatients = async (req, res) => {
  // safety: require ?confirm=true to avoid accidental nukes
  if (req.query.confirm !== "true") {
    return res.status(400).json({
      message:
        "Dangerous operation blocked. Re-try with ?confirm=true to delete ALL patients.",
    });
  }

  const cascade = req.query.cascade === "true"; // also delete schedules & billing
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // fetch ids for cascade
    const ids = (await Patient.find({}, "_id", { session })).map((p) => p._id);

    const patientResult = await Patient.deleteMany({}, { session });

    let scheduleResult = { deletedCount: 0 };
    let billingResult = { deletedCount: 0 };

    if (cascade && ids.length) {
      scheduleResult = await Schedule.deleteMany(
        { patient: { $in: ids } },
        { session }
      );
      billingResult = await Billing.deleteMany(
        { patient: { $in: ids } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      message: "All patients deleted.",
      patientsDeleted: patientResult.deletedCount,
      schedulesDeleted: scheduleResult.deletedCount,
      billingsDeleted: billingResult.deletedCount,
      cascade,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ deleteAllPatients error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
