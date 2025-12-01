// controllers/bed.controller.js
import Bed from "../models/bed.model.js";

//
// ───────────────────────── CREATE ─────────────────────────
//

// POST /api/beds
export const createBed = async (req, res) => {
  try {
    const bed = new Bed(req.body); // code auto-generated
    const saved = await bed.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to create bed",
      error: err.message,
    });
  }
};

//
// ───────────────────────── READ ─────────────────────────
//

// GET /api/beds
export const getBeds = async (_req, res) => {
  try {
    const beds = await Bed.find().sort({ createdAt: -1 });
    res.json({ success: true, beds });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get beds",
      error: err.message,
    });
  }
};

// GET /api/beds/:code
export const getBedByCode = async (req, res) => {
  try {
    const bed = await Bed.findOne({ code: req.params.code });
    if (!bed)
      return res.status(404).json({ success: false, message: "Bed not found" });

    res.json({ success: true, bed });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get bed",
      error: err.message,
    });
  }
};

//
// ───────────────────────── UPDATE ─────────────────────────
//

// PATCH /api/beds/:code
export const updateBedByCode = async (req, res) => {
  try {
    const bed = await Bed.findOneAndUpdate(
      { code: req.params.code },
      { $set: req.body },
      { new: true }
    );

    if (!bed)
      return res.status(404).json({ success: false, message: "Bed not found" });

    res.json({ success: true, bed });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to update bed",
      error: err.message,
    });
  }
};

//
// ───────────────────────── DELETE ─────────────────────────
//

// DELETE /api/beds/:code
export const deleteBedByCode = async (req, res) => {
  try {
    const bed = await Bed.findOneAndDelete({ code: req.params.code });
    if (!bed)
      return res.status(404).json({ success: false, message: "Bed not found" });

    res.json({ success: true, message: "Bed deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete bed",
      error: err.message,
    });
  }
};

//
// ───────────────────────── DELETE ALL (ADMIN) ─────────────────────────
//

// DELETE /api/beds?confirm=true
// DELETE /api/beds?confirm=true
export const deleteAllBeds = async (req, res) => {
  try {
    // ✅ Only confirmation check here
    if (req.query.confirm !== "true") {
      return res.status(400).json({
        success: false,
        message:
          "Dangerous operation blocked. Use ?confirm=true to delete ALL beds.",
      });
    }

    const result = await Bed.deleteMany({});

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No beds found to delete",
      });
    }

    return res.json({
      success: true,
      message: "All beds deleted successfully",
      bedsDeleted: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete beds",
      error: err.message,
    });
  }
};

//
// ───────────────────────── UPDATE STATUS ─────────────────────────
//

// PATCH /api/beds/:code/status
export const updateBedStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const bed = await Bed.findOneAndUpdate(
      { code: req.params.code },
      { $set: { status } },
      { new: true }
    );

    if (!bed)
      return res.status(404).json({ success: false, message: "Bed not found" });

    res.json({ success: true, bed });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to update bed status",
      error: err.message,
    });
  }
};
