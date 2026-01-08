// controllers/bed.controller.js
import Bed from "../models/bed.model.js";

// ───────────────────────── CREATE ─────────────────────────
//

// POST /api/beds
export const createBed = async (req, res) => {
  try {
    const { name, type, status, location, capacity, notes } = req.body;

    if (!name || !type || !status || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please check your input.",
      });
    }

    // Check if a bed with the same code already exists
    const existingBed = await Bed.findOne({ code: req.body.code });
    if (existingBed) {
      return res.status(400).json({
        success: false,   
        message: "Bed with this code already exists.",
      });
    }

    // Create the new bed record
    const newBed = new Bed({
      name,
      type,
      status,
      location,
      capacity,
      notes,
    });

    // Save the new bed record
    await newBed.save();

    return res.status(201).json({
      success: true,
      message: "New bed created successfully!",
      bed: newBed,
    });
  } catch (error) {
    console.error("Error creating bed:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
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
