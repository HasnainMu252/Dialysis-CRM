import Bed from "../models/bed.model.js";

export const releaseMaintenanceBeds = async (_req, res) => {
  const now = new Date();

  const result = await Bed.updateMany(
    { status: "UnderMaintenance", maintenanceUntil: { $ne: null, $lte: now } },
    { $set: { status: "Available", maintenanceUntil: null } }
  );

  res.json({ success: true, released: result.modifiedCount });
};
