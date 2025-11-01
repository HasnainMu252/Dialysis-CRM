// server/src/middleware/error.js

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, _next) => {
  console.error("❌ Error caught:", err);

  // Default to 500 unless already set
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // 🧩 1️⃣ Handle missing fields (blank form)
  if (err.name === "ValidationError") {
    const missingFields = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");

    // if contains "required", send generic
    if (missingFields.toLowerCase().includes("required")) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    // email format check
    if (missingFields.toLowerCase().includes("email")) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // phone validation check
    if (missingFields.toLowerCase().includes("phone")) {
      return res
        .status(400)
        .json({ message: "Phone number must contain 11–12 digits only." });
    }

    // fallback for other mongoose validation errors
    return res.status(400).json({ message: missingFields });
  }

  // 🧩 2️⃣ Handle invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  // 🧩 3️⃣ Duplicate key (email, MRN)
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `Duplicate ${field} already exists.` });
  }

  // 🧩 4️⃣ Default fallback
  res.status(statusCode).json({
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack
  });
};
