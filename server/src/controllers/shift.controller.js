import Shift from "../models/shift.model.js";
import User from "../models/user.model.js";
import Schedule from "../models/schedule.model.js";

export const createShift = async (req, res) => {
  try {
    const { name, startTime, endTime, isActive } = req.body;
    if (!name || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "name, startTime, endTime required" });
    }

    const shift = await Shift.create({ name, startTime, endTime, isActive: isActive ?? true, staff: [] });
    return res.status(201).json({ success: true, message: "Shift created", shift });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
};

export const listShifts = async (_req, res) => {
  const shifts = await Shift.find().sort({ createdAt: -1 }).populate("staff.userId", "name email role");
  res.json({ success: true, count: shifts.length, shifts });
};

export const getShift = async (req, res) => {
  const shift = await Shift.findOne({ code: req.params.code }).populate("staff.userId", "name email role");
  if (!shift) return res.status(404).json({ success: false, message: "Shift not found" });
  res.json({ success: true, shift });
};

export const updateShift = async (req, res) => {
  const shift = await Shift.findOneAndUpdate({ code: req.params.code }, req.body, {
    new: true,
    runValidators: true,
  }).populate("staff.userId", "name email role");

  if (!shift) return res.status(404).json({ success: false, message: "Shift not found" });
  res.json({ success: true, message: "Shift updated", shift });
};

// Assign staff to shift (Admin)
export const assignStaff = async (req, res) => {
  try {
    const { code } = req.params;
    const { userId } = req.body;

    const shift = await Shift.findOne({ code });
    if (!shift) return res.status(404).json({ success: false, message: "Shift not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!["Nurse", "CaseManager", "Biller"].includes(user.role)) {
      return res.status(400).json({ success: false, message: "Only Nurse/CaseManager/Biller can be assigned" });
    }

    const exists = shift.staff.some((s) => String(s.userId) === String(user._id));
    if (!exists) shift.staff.push({ userId: user._id, role: user.role });

    await shift.save();
    const populated = await Shift.findById(shift._id).populate("staff.userId", "name email role");

    res.json({ success: true, message: "Staff assigned", shift: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
};

export const removeStaff = async (req, res) => {
  const shift = await Shift.findOne({ code: req.params.code });
  if (!shift) return res.status(404).json({ success: false, message: "Shift not found" });

  shift.staff = shift.staff.filter((s) => String(s.userId) !== String(req.params.userId));
  await shift.save();

  const populated = await Shift.findById(shift._id).populate("staff.userId", "name email role");
  res.json({ success: true, message: "Staff removed", shift: populated });
};

// Simple workload (today): sessions count per shift window
export const todayWorkload = async (_req, res) => {
  const now = new Date();
  const startOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const endOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));

  const shifts = await Shift.find({ isActive: true }).lean();

  // Count schedules for today (based on startAt if you added it, else date)
  const schedules = await Schedule.find({ startAt: { $gte: startOfDayUTC, $lte: endOfDayUTC } }).lean();

  const toMin = (t) => {
    const [H, M] = t.split(":").map(Number);
    return H * 60 + M;
  };

  const result = shifts.map((sh) => {
    const sMin = toMin(sh.startTime);
    const eMin = toMin(sh.endTime);

    const count = schedules.filter((sc) => {
      const d = new Date(sc.startAt);
      const minutes = d.getUTCHours() * 60 + d.getUTCMinutes();
      return minutes >= sMin && minutes < eMin;
    }).length;

    return {
      shiftCode: sh.code,
      name: sh.name,
      startTime: sh.startTime,
      endTime: sh.endTime,
      staffCount: sh.staff?.length || 0,
      todaySessions: count,
    };
  });

  res.json({ success: true, workload: result });
};
    