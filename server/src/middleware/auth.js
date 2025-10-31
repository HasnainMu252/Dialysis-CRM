import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const requireAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user || !req.user.active) {
      return res.status(401).json({ message: "Invalid token/user" });
    }
    next();
  } catch (e) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const authorizeRoles = (...allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!allowed.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};
