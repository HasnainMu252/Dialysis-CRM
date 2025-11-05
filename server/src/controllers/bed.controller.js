import Bed, { BedStatus } from "../models/bed.model.js";
import Schedule from "../models/schedule.model.js";

// Create bed (Admin)
export const createBed = async (req, res) => {
  const bed = await Bed.create(req.body);
  res.status(201).json(bed);
};

// List all beds with current status
export const getBeds = async (_req, res) => {
  const beds = await Bed.find().sort({ name: 1 });
  res.json(beds);
};

// Update bed (status, name, notes)
export const updateBed = async (req, res) => {
  const bed = await Bed.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!bed) return res.status(404).json({ message: "Bed not found" });
  res.json(bed);
};

// Optional: simple availability check for a date & time range
export const getBedAvailability = async (req, res) => {
  // query: ?date=YYYY-MM-DD&start=HH:mm&end=HH:mm
  const { date, start, end } = req.query;
  if (!date || !start || !end) return res.status(400).json({ message: "date, start, end required" });

  // normalized UTC date (same helper as schedule controller)
  const [y,m,d] = date.split("-").map(Number);
  const day = new Date(Date.UTC(y, m-1, d, 0,0,0,0));

  const schedules = await Schedule.find({ date: day });
  // Return each bed with a flag "isFree" for that slot
  const toMin = (t)=>{ const [H,M]=t.split(":").map(Number); return H*60+M; };
  const reqS = toMin(start), reqE = toMin(end);

  const beds = await Bed.find().sort({ name: 1 }).lean();
  const result = beds.map(b => {
    const clashes = schedules.filter(s => String(s.bed) === String(b._id)).some(s=>{
      const sS=toMin(s.startTime), sE=toMin(s.endTime);
      // session (2h) + maintenance (30m) block — we treat occupied until end+30
      const sEWithMaint = sE + 30;
      return !(reqE <= sS || reqS >= sEWithMaint);
    });
    return { ...b, isFree: !clashes };
  });

  res.json(result);
};
