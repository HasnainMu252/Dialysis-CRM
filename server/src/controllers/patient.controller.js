import Patient from "../models/patient.model.js";

export const createPatient = async (req, res) => {
  const patient = await Patient.create(req.body);
  res.status(201).json(patient);
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
