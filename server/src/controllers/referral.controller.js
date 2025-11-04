import Referral from "../models/referral.model.js";

export const createReferral = async (req, res) => {
  const ref = await Referral.create(req.body);
  res.status(201).json(ref);
};

export const getReferrals = async (req, res) => {
  const refs = await Referral.find();
  res.json(refs);
};

export const getReferral = async (req, res) => {
  const ref = await Referral.findById(req.params.id);
  if (!ref) return res.status(404).json({ message: "Referral not found" });
  res.json(ref);
};

export const updateReferral = async (req, res) => {
  const ref = await Referral.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!ref) return res.status(404).json({ message: "Referral not found" });
  res.json(ref);
};

export const deleteReferral = async (req, res) => {
  const ref = await Referral.findByIdAndDelete(req.params.id);
  if (!ref) return res.status(404).json({ message: "Referral not found" });
  res.json({ message: "Deleted" });
};
