import mongoose from "mongoose";
import { mongooseDateTransform } from "../../../client/src/utils/mongooseTransform.js";


export const BedStatus = ["Available", "Busy", "UnderMaintenance"];

const bedSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Bed 1"
  status: { type: String, enum: BedStatus, default: "Available" },
  notes: String
}, { timestamps: true },mongooseDateTransform);

export default mongoose.model("Bed", bedSchema);
