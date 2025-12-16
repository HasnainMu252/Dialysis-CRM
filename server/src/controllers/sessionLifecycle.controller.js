import Schedule from "../models/schedule.model.js";
import Bed from "../models/bed.model.js";
import Settings from "../models/settings.model.js";

const getMaintenanceMinutes = async () => {
  const s = await Settings.findOne();
  return s?.maintenanceMinutes ?? 30;
};

export const checkIn = async (req, res) => {
  const { code } = req.params;

  const sch = await Schedule.findOne({ code });
  if (!sch) return res.status(404).json({ success:false, message:"Schedule not found" });

  sch.state = "CheckedIn";
  sch.actualStartAt = sch.actualStartAt || new Date();
  await sch.save();

  // mark bed busy
  await Bed.findByIdAndUpdate(sch.bed, { status: "Busy" });

  res.json({ success:true, message:"Checked-In", schedule: sch });
};

export const startSession = async (req, res) => {
  const { code } = req.params;

  const sch = await Schedule.findOne({ code });
  if (!sch) return res.status(404).json({ success:false, message:"Schedule not found" });

  sch.state = "InProgress";
  sch.actualStartAt = sch.actualStartAt || new Date();
  await sch.save();

  await Bed.findByIdAndUpdate(sch.bed, { status: "Busy" });

  res.json({ success:true, message:"Session In-Progress", schedule: sch });
};

export const completeSession = async (req, res) => {
  const { code } = req.params;

  const sch = await Schedule.findOne({ code });
  if (!sch) return res.status(404).json({ success:false, message:"Schedule not found" });

  sch.state = "Completed";
  sch.actualEndAt = new Date();
  await sch.save();

  const minutes = await getMaintenanceMinutes();
  const maintenanceUntil = new Date(Date.now() + minutes * 60 * 1000);

  await Bed.findByIdAndUpdate(sch.bed, {
    status: "UnderMaintenance",
    maintenanceUntil,
    lastMaintenanceAt: new Date(),
  });

  // optional: set schedule state to Maintenance also
  // sch.state = "Maintenance"; await sch.save();

  res.json({
    success:true,
    message:`Completed. Bed locked for ${minutes} min`,
    schedule: sch,
    maintenanceUntil,
  });
};

export const markNoShow = async (req, res) => {
  const { code } = req.params;

  const sch = await Schedule.findOne({ code });
  if (!sch) return res.status(404).json({ success:false, message:"Schedule not found" });

  sch.state = "NoShow";
  await sch.save();

  // free bed
  await Bed.findByIdAndUpdate(sch.bed, { status: "Available" });

  res.json({ success:true, message:"Marked as No-Show", schedule: sch });
};
