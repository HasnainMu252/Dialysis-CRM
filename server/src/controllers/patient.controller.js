import Patient from "../models/patient.model.js";
import mongoose from "mongoose";
import Schedule from "../models/schedule.model.js";
import Billing from "../models/billing.model.js";

export const createPatient = async (req, res) => {
  try {
    const { phone, email } = req.body;

    // 1️⃣ Check if patient already exists by phone or email
    const existingPatient = await Patient.findOne({
      $or: [{ phone }, { email }]
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient with this phone or email already exists",
        patient: existingPatient,
      });
    }

    // 2️⃣ Create new patient (MRN will be generated automatically)
    const patient = await Patient.create(req.body);

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      patient
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const listPatients = async (req, res) => {
  try {
    const q = req.query.q;
    const filter = q
      ? {
          $or: [
            { firstName: new RegExp(q, "i") },
            { lastName: new RegExp(q, "i") },
            { mrn: new RegExp(q, "i") },
          ],
        }
      : {};
    const patients = await Patient.find(filter).sort("-createdAt").limit(50);
    res.json({
      success: true,
      patients
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get patient by MRN
export const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ mrn: req.params.mrn });
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: "Patient not found" 
      });
    }
    res.json({
      success: true,
      patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update patient by MRN
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { mrn: req.params.mrn },
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: "Patient not found" 
      });
    }
    res.json({
      success: true,
      message: "Patient updated successfully",
      patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove patient by MRN
export const removePatient = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const mrn = req.params.mrn;
    
    // Find patient first to get MRN for cascade deletion
    const patient = await Patient.findOne({ mrn }, null, { session });
    if (!patient) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: "Patient not found" 
      });
    }

    // Delete patient and related records using MRN
    const patientResult = await Patient.deleteOne({ mrn }, { session });
    
    // Delete related schedules and billings using MRN
    const scheduleResult = await Schedule.deleteMany(
      { patientMrn: mrn }, 
      { session }
    );
    
    const billingResult = await Billing.deleteMany(
      { patientMrn: mrn }, 
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Patient deleted successfully",
      deletedPatient: patientResult.deletedCount,
      deletedSchedules: scheduleResult.deletedCount,
      deletedBillings: billingResult.deletedCount
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete all patients (with cascade option)
export const deleteAllPatients = async (req, res) => {
  if (req.query.confirm !== "true") {
    return res.status(400).json({
      success: false,
      message: "Dangerous operation blocked. Re-try with ?confirm=true to delete ALL patients.",
    });
  }

  const cascade = req.query.cascade === "true";
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch all patients to get MRNs for cascade deletion
    const patients = await Patient.find({}, "mrn", { session });
    const mrns = patients.map((p) => p.mrn);

    const patientResult = await Patient.deleteMany({}, { session });

    let scheduleResult = { deletedCount: 0 };
    let billingResult = { deletedCount: 0 };

    if (cascade && mrns.length) {
      // Delete related schedules and billings using MRN
      scheduleResult = await Schedule.deleteMany(
        { patientMrn: { $in: mrns } },
        { session }
      );
      billingResult = await Billing.deleteMany(
        { patientMrn: { $in: mrns } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: "All patients deleted successfully",
      patientsDeleted: patientResult.deletedCount,
      schedulesDeleted: scheduleResult.deletedCount,
      billingsDeleted: billingResult.deletedCount,
      cascade,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ deleteAllPatients error:", err);
    return res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Get patient schedules by MRN
export const getPatientSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ patientMrn: req.params.mrn }).sort("-createdAt");
    res.json({
      success: true,
      schedules
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get patient billings by MRN
export const getPatientBillings = async (req, res) => {
  try {
    const billings = await Billing.find({ patientMrn: req.params.mrn }).sort("-createdAt");
    res.json({
      success: true,
      billings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};