import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already in use" });
  const user = await User.create({ name, email, password, role });
  const token = signToken(user._id);
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    console.log("❌ User not found:", email);
    return res.status(400).json({ message: "Invalid credentials" });
  }

  console.log("🧠 Found user:", user.email);
  console.log("🔐 Stored hash:", user.password);
  console.log("🧩 Incoming password:", password);

  const ok = await user.comparePassword(password);
  console.log("✅ Compare result:", ok);

  if (!ok) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d"
  });

  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token
  });
};


export const me = async (req, res) => {
  res.json({ user: req.user });
};
