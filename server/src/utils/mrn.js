import Counter from "../models/counter.model.js";

export const nextMrn = async () => {
  const c = await Counter.findOneAndUpdate(
    { key: "patient_mrn" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // MRN000001 format
  const n = String(c.seq).padStart(2, "0");
  return `MRN${n}`;
};
