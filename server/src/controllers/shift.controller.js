import Shift from "../models/shift.model.js";
import User from "../models/user.model.js";
import Schedule from "../models/schedule.model.js";

// Helper to format shift response with user-friendly staff info
const formatShiftResponse = (shift) => {
  const shiftObj = shift.toObject ? shift.toObject() : shift;
  return {
    ...shiftObj,
    staff: shiftObj.staff?.map((s) => ({
      userId: s.userId?.userId || s.userId,  // user-friendly ID
      _id: s.userId?._id || s.userId,        // MongoDB _id (for reference)
      name: s.userId?.name,
      email: s.userId?.email,
      role: s.role,
    })),
  };
};



export const createShift = async (req, res) => {
  try {
    const { name, startTime, endTime, isActive } = req.body;
    if (!name || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        message: "name, startTime, endTime required" 
      });
    }

    const shift = await Shift.create({ 
      name, 
      startTime, 
      endTime, 
      isActive: isActive ?? true, 
      staff: [] 
    });
    
    return res.status(201).json({ 
      success: true, 
      message: "Shift created", 
      shift 
    });
  } catch (e) {
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: e.message 
    });
  }
};

export const listShifts = async (_req, res) => {
  try {
    const shifts = await Shift.find()
      .sort({ createdAt: -1 })
      .populate("staff.userId", "name email role userId");  // Added userId field
    
    res.json({ 
      success: true, 
      count: shifts.length, 
      shifts: shifts.map(formatShiftResponse) 
    });
  } catch (e) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: e.message 
    });
  }
};

export const getShift = async (req, res) => {
  try {
    const shift = await Shift.findOne({ code: req.params.code })
      .populate("staff.userId", "name email role userId");  // Added userId field
    
    if (!shift) {
      return res.status(404).json({ 
        success: false, 
        message: "Shift not found" 
      });
    }
    
    res.json({ 
      success: true, 
      shift: formatShiftResponse(shift) 
    });
  } catch (e) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: e.message 
    });
  }
};

export const updateShift = async (req, res) => {
  try {
    const shift = await Shift.findOneAndUpdate(
      { code: req.params.code }, 
      req.body, 
      { new: true, runValidators: true }
    ).populate("staff.userId", "name email role userId");

    if (!shift) {
      return res.status(404).json({ 
        success: false, 
        message: "Shift not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Shift updated", 
      shift: formatShiftResponse(shift) 
    });
  } catch (e) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: e.message 
    });
  }
};

// ✅ Assign staff using user-friendly userId (e.g., "usr-01")
export const assignStaff = async (req, res) => {
  try {
    const { code } = req.params;
    const { userId } = req.body;  // Expects "usr-01" format

    // Validate input
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "userId is required (e.g., 'usr-01')" 
      });
    }

    const shift = await Shift.findOne({ code });
    if (!shift) {
      return res.status(404).json({ 
        success: false, 
        message: "Shift not found" 
      });
    }

    // 🔍 Find user by user-friendly userId field
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: `User with ID '${userId}' not found` 
      });
    }

    // Check role eligibility
    if (!["Nurse", "CaseManager", "Biller"].includes(user.role)) {
      return res.status(400).json({ 
        success: false, 
        message: "Only Nurse/CaseManager/Biller can be assigned to shifts" 
      });
    }

    // Check if already assigned (compare MongoDB _id)
    const alreadyAssigned = shift.staff.some(
      (s) => String(s.userId) === String(user._id)
    );
    
    if (alreadyAssigned) {
      return res.status(400).json({ 
        success: false, 
        message: `User '${userId}' is already assigned to this shift` 
      });
    }

    // Add staff (store MongoDB _id internally)
    shift.staff.push({ userId: user._id, role: user.role });
    await shift.save();

    const populated = await Shift.findById(shift._id)
      .populate("staff.userId", "name email role userId");

    res.json({ 
      success: true, 
      message: `Staff '${userId}' assigned successfully`, 
      shift: formatShiftResponse(populated) 
    });
  } catch (e) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: e.message 
    });
  }
};

// ✅ Remove staff using user-friendly userId (e.g., "usr-01")
export const removeStaff = async (req, res) => {
  try {
    const { code, userId } = req.params;  // userId is now "usr-01" format

    const shift = await Shift.findOne({ code });
    if (!shift) {
      return res.status(404).json({ 
        success: false, 
        message: "Shift not found" 
      });
    }

    // 🔍 Find user by user-friendly userId field
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: `User with ID '${userId}' not found` 
      });
    }

    // Check if user is in this shift
    const wasAssigned = shift.staff.some(
      (s) => String(s.userId) === String(user._id)
    );
    
    if (!wasAssigned) {
      return res.status(400).json({ 
        success: false, 
        message: `User '${userId}' is not assigned to this shift` 
      });
    }

    // Remove staff (compare MongoDB _id)
    shift.staff = shift.staff.filter(
      (s) => String(s.userId) !== String(user._id)
    );
    await shift.save();

    const populated = await Shift.findById(shift._id)
      .populate("staff.userId", "name email role userId");

    res.json({ 
      success: true, 
      message: `Staff '${userId}' removed successfully`, 
      shift: formatShiftResponse(populated) 
    });
  } catch (e) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: e.message 
    });
  }
};

// Today's workload report
export const todayWorkload = async (_req, res) => {
  try {
    const now = new Date();
    const startOfDayUTC = new Date(Date.UTC(
      now.getUTCFullYear(), 
      now.getUTCMonth(), 
      now.getUTCDate(), 
      0, 0, 0
    ));
    const endOfDayUTC = new Date(Date.UTC(
      now.getUTCFullYear(), 
      now.getUTCMonth(), 
      now.getUTCDate(), 
      23, 59, 59
    ));

    const shifts = await Shift.find({ isActive: true })
      .populate("staff.userId", "name email role userId")
      .lean();

    const schedules = await Schedule.find({ 
      startAt: { $gte: startOfDayUTC, $lte: endOfDayUTC } 
    }).lean();

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
        staff: sh.staff?.map((s) => ({
          userId: s.userId?.userId,
          name: s.userId?.name,
          role: s.role,
        })),
        todaySessions: count,
      };
    });

    res.json({ success: true, workload: result });
  } catch (e) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: e.message 
    });
  }
};

export const deleteShift = async (req, res) => {
  try {
    const { code } = req.params;

    const shift = await Shift.findOne({ code });
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    const hasSchedules = await Schedule.exists({
      $or: [{ shiftCode: code }, { shift: shift._id }],
    });

    if (hasSchedules) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete shift with existing schedules. Deactivate it instead.",
      });
    }

    await Shift.deleteOne({ _id: shift._id });

    return res.json({
      success: true,
      message: "Shift deleted successfully",
      code,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: e.message,
    });
  }
};