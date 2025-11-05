import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import userModel from "../models/user.model.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });


export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // create new user (plain password)
    const user = await User.create({ name, email, password, role });

    // create token
    const token = signToken(user._id);

    // response
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const ok = user.comparePassword(password);
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token
  });
};


// export const me = async (req, res) => {
//   res.json({ user: req.user });
// };

export const me = async (req, res) => {
  // const q = req.query.q;
  // const filter = q
  //   ? { $or: [{ name: new RegExp(q, "i") }, { lastName: new RegExp(q, "i") }, { mrn: new RegExp(q, "i") }] }
  //   : {};
  const users = await userModel.find({})
  res.json(users)
    ;
  }
