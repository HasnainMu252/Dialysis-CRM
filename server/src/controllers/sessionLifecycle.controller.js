import Schedule from "../models/schedule.model.js";
import Bed from "../models/bed.model.js";
import Settings from "../models/settings.model.js";

const addMinutes = (d, m) => new Date(d.getTime() + m * 60000);

const getMaintenanceMinutes = async () => {
  const s = await Settings.findOne();
  return s?.maintenanceMinutes ?? 30;
};

export const checkIn = async (req, res) => {
  try {
    const { code } = req.params;

    const sch = await Schedule.findOne({ code });
    if (!sch)
      return res.status(404).json({ success: false, message: "Schedule not found" });

    sch.state = "CheckedIn";
    sch.actualStartAt = sch.actualStartAt || new Date();
    await sch.save();

    // mark bed busy
    await Bed.findByIdAndUpdate(sch.bed, { status: "Busy" });

    return res.json({ success: true, message: "Checked-In", schedule: sch });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
};

export const startSession = async (req, res) => {
  try {
    const { code } = req.params;

    const sch = await Schedule.findOne({ code });
    if (!sch)
      return res.status(404).json({ success: false, message: "Schedule not found" });

    sch.state = "InProgress";
    sch.actualStartAt = sch.actualStartAt || new Date();
    await sch.save();

    await Bed.findByIdAndUpdate(sch.bed, { status: "Busy" });

    return res.json({ success: true, message: "Session In-Progress", schedule: sch });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
};

export const completeSession = async (req, res) => {
  try {
    const { code } = req.params;

    const sch = await Schedule.findOne({ code });
    if (!sch)
      return res.status(404).json({ success: false, message: "Schedule not found" });

    // ✅ mark schedule completed
    sch.state = "Completed";
    sch.actualEndAt = new Date();
    await sch.save();

    // ✅ lock bed in maintenance for X minutes (from Settings)
    const minutes = await getMaintenanceMinutes();
    const maintenanceUntil = addMinutes(new Date(), minutes);

    await Bed.findByIdAndUpdate(sch.bed, {
      status: "UnderMaintenance", // (use "Maintenance" if that's what your Bed enum expects)
      maintenanceUntil,
      lastMaintenanceAt: new Date(),
    });

    // Optional: if you also want schedule to show Maintenance state
    // sch.state = "Maintenance";
    // await sch.save();

    return res.json({
      success: true,
      message: `Completed. Bed locked for ${minutes} min`,
      schedule: sch,
      maintenanceUntil,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
};

export const markNoShow = async (req, res) => {
  try {
    const { code } = req.params;

    const sch = await Schedule.findOne({ code });
    if (!sch)
      return res.status(404).json({ success: false, message: "Schedule not found" });

    sch.state = "NoShow";
    await sch.save();

    // free bed
    await Bed.findByIdAndUpdate(sch.bed, { status: "Available" });

    return res.json({ success: true, message: "Marked as No-Show", schedule: sch });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
};
3