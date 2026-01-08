const jwt = require("jsonwebtoken");

module.exports = function patientAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Patient token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // IMPORTANT: set patient identity on req
    req.patient = decoded; // must include patientId or mrn in token payload

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid patient token" });
  }
};
