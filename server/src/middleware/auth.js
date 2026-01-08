import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";

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


export const patientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the patient by email
    const patient = await Patient.findOne({ email });

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare the provided password with the hashed password in DB
    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // expires in 1 hour
    });

    // Send back the JWT token as a cookie (or as a response body)
    res.cookie("token", token, { httpOnly: true }).json({
      success: true,
      message: "Logged in successfully",
      token,
      patient: {
        mrn: patient.mrn,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};


export const authorizeRoles = (...allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!allowed.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};


export const requirePatientAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "Patient token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Must be patient token AND must include identity
    if (decoded?.tokenType !== "patient" || (!decoded?.patientId && !decoded?.mrn)) {
      return res.status(401).json({ message: "Not a patient token" });
    }

    req.patient = decoded; // { tokenType, patientId, mrn }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid patient token" });
  }
};

