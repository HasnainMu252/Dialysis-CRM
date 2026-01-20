import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const RoleEnum = ["Admin", "Nurse", "CaseManager", "Biller", "Patient"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: RoleEnum, default: "Nurse" },
    active: { type: Boolean, default: true },
    userId: { type: String, unique: true }, // Add this line
  },
  { timestamps: true }
);

// Pre-save hook to generate the userId
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("User").countDocuments();
    this.userId = `usr-${String(count + 1).padStart(2, "0")}`;
  }

  // Hash password if it's modified
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
