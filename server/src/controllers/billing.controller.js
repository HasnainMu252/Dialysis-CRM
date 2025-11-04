import Billing from "../models/billing.model.js";

export const createBilling = async (req, res) => {
  const billing = await Billing.create(req.body);
  res.status(201).json(billing);
};

export const getBillings = async (req, res) => {
  const bills = await Billing.find().populate("patient", "firstName lastName mrn");
  res.json(bills);
};

export const getBilling = async (req, res) => {
  const bill = await Billing.findById(req.params.id).populate("patient");
  if (!bill) return res.status(404).json({ message: "Billing not found" });
  res.json(bill);
};

export const updateBilling = async (req, res) => {
  const bill = await Billing.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!bill) return res.status(404).json({ message: "Billing not found" });
  res.json(bill);
};

export const deleteBilling = async (req, res) => {
  const bill = await Billing.findByIdAndDelete(req.params.id);
  if (!bill) return res.status(404).json({ message: "Billing not found" });
  res.json({ message: "Deleted" });
};
