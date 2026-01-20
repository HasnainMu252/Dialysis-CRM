
import User ,{RoleEnum} from "../models/user.model.js";

const formatUser = (u) => ({
  id: u._id,
  userId: u.userId,  // Add userId here
  name: u.name,
  email: u.email,
  role: u.role,
  active: u.active,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});
export const listUsers = async (req, res) => {
  try {
    const { q, role, active } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (active === "true") filter.active = true;
    if (active === "false") filter.active = false;

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, count: users.length, users: users.map(formatUser) });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const u = await User.findOne({ userId: req.params.id }); // Search by userId instead of _id
    if (!u) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: formatUser(u) });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
};

export const toggleUserActive = async (req, res) => {
  try {
    const u = await User.findOne({ userId: req.params.id }); // Search by userId instead of _id
    if (!u) return res.status(404).json({ success: false, message: "User not found" });
    u.active = !u.active;
    await u.save();
    res.json({ success: true, message: "User toggled", user: formatUser(u) });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const u = await User.findOneAndDelete({ userId: req.params.id }); // Search by userId instead of _id
    if (!u) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted" });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const allowed = {};
    if (req.body.name !== undefined) allowed.name = req.body.name;

    if (req.body.role !== undefined) {
      if (!RoleEnum.includes(req.body.role)) {
        return res.status(400).json({ success: false, message: "Invalid role" });
      }
      allowed.role = req.body.role;
    }

    if (req.body.active !== undefined) allowed.active = !!req.body.active;

    const u = await User.findOneAndUpdate({ userId: req.params.id }, allowed, { // Search by userId instead of _id
      new: true,
      runValidators: true,
    });

    if (!u) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User updated", user: formatUser(u) });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
}