// controllers/bed.controller.js
import Bed from "../models/bed.model.js";

// POST /api/beds
export const createBed = async (req, res) => {
  try {
    const bed = new Bed(req.body); // code auto-generated
    const saved = await bed.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Failed to create bed", error: err.message });
  }
};

// GET /api/beds
export const getBeds = async (_req, res) => {
  try {
    const beds = await Bed.find().sort({ createdAt: -1 });
    res.json(beds);
  } catch (err) {
    res.status(500).json({ message: "Failed to get beds", error: err.message });
  }
};

// GET /api/beds/:code
export const getBedByCode = async (req, res) => {
  try {
    const bed = await Bed.findOne({ code: req.params.code });
    if (!bed) return res.status(404).json({ message: "Bed not found" });
    res.json(bed);
  } catch (err) {
    res.status(500).json({ message: "Failed to get bed", error: err.message });
  }
};

// PATCH /api/beds/:code
export const updateBedByCode = async (req, res) => {
  try {
    const bed = await Bed.findOneAndUpdate(
      { code: req.params.code },
      { $set: req.body },
      { new: true }
    );
    if (!bed) return res.status(404).json({ message: "Bed not found" });
    res.json(bed);
  } catch (err) {
    res.status(400).json({ message: "Failed to update bed", error: err.message });
  }
};

// DELETE /api/beds/:code
export const deleteBedByCode = async (req, res) => {
  try {
    const bed = await Bed.findOneAndDelete({ code: req.params.code });
    if (!bed) return res.status(404).json({ message: "Bed not found" });
    res.json({ message: "Bed deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete bed", error: err.message });
  }
};

// PATCH /api/beds/:code/status
export const updateBedStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bed = await Bed.findOneAndUpdate(
      { code: req.params.code },
      { $set: { status } },
      { new: true }
    );
    if (!bed) return res.status(404).json({ message: "Bed not found" });
    res.json(bed);
  } catch (err) {
    res.status(400).json({ message: "Failed to update status", error: err.message });
  }
};
