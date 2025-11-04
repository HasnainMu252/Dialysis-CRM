import Schedule from "../models/schedule.model.js";





export const createSchedule = async (req, res) => {
  try {
    const { patient, date, startTime, endTime, station, nurse } = req.body;
    const scheduleDate = new Date(date);

    // 🧠 Helper function to convert HH:mm → minutes (easier comparison)
    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);

    // 1️⃣ Check same patient duplicate
    const samePatient = await Schedule.findOne({
      patient,
      date: scheduleDate,
      $or: [
        {
          $and: [
            { startTime: { $lte: endTime } },
            { endTime: { $gte: startTime } }
          ]
        }
      ]
    });

    if (samePatient) {
      return res.status(400).json({
        message: "⚠️ Conflict: This patient already has a session at this date/time."
      });
    }

    // 2️⃣ Check if same machine booked at same time
    const sameMachine = await Schedule.findOne({
      station,
      date: scheduleDate,
      $and: [
        { startTime: { $lte: endTime } },
        { endTime: { $gte: startTime } }
      ]
    });

    if (sameMachine) {
      // find next available slot for this machine
      const allMachineSchedules = await Schedule.find({ station, date: scheduleDate }).sort({ startTime: 1 });
      const machineSlots = allMachineSchedules.map(s => ({
        start: toMinutes(s.startTime),
        end: toMinutes(s.endTime)
      }));

      let nextAvailable = "end of day";
      for (let i = 0; i < machineSlots.length; i++) {
        const { end: slotEnd } = machineSlots[i];
        const nextSlot = machineSlots[i + 1];
        if (nextSlot && nextSlot.start - slotEnd >= 30) { // at least 30 min gap
          nextAvailable = `${Math.floor(slotEnd / 60)
            .toString()
            .padStart(2, "0")}:${(slotEnd % 60).toString().padStart(2, "0")}`;
          break;
        }
      }

      return res.status(400).json({
        message: `⚠️ Conflict: ${station} is already booked on ${date} between ${sameMachine.startTime}–${sameMachine.endTime}.`,
        suggestion: `💡 Next available slot for ${station}: ${nextAvailable}`
      });
    }

    // 3️⃣ Check if nurse booked at same time
    const sameNurse = await Schedule.findOne({
      nurse,
      date: scheduleDate,
      $and: [
        { startTime: { $lte: endTime } },
        { endTime: { $gte: startTime } }
      ]
    });

    if (sameNurse) {
      const allNurseSchedules = await Schedule.find({ nurse, date: scheduleDate }).sort({ startTime: 1 });
      const nurseSlots = allNurseSchedules.map(s => ({
        start: toMinutes(s.startTime),
        end: toMinutes(s.endTime)
      }));

      let nextAvailable = "end of day";
      for (let i = 0; i < nurseSlots.length; i++) {
        const { end: slotEnd } = nurseSlots[i];
        const nextSlot = nurseSlots[i + 1];
        if (nextSlot && nextSlot.start - slotEnd >= 30) {
          nextAvailable = `${Math.floor(slotEnd / 60)
            .toString()
            .padStart(2, "0")}:${(slotEnd % 60).toString().padStart(2, "0")}`;
          break;
        }
      }

      return res.status(400).json({
        message: `⚠️ Conflict: Nurse is already assigned on ${date} between ${sameNurse.startTime}–${sameNurse.endTime}.`,
        suggestion: `💡 Next available slot for this nurse: ${nextAvailable}`
      });
      
    }
    // ✅ No conflicts — create schedule
    const schedule = await Schedule.create({
        patient,
        date: scheduleDate,
        startTime,
        endTime,
        station,
        nurse
    });
//     schedule = await schedule.populate("patient", "firstName lastName mrn");
//    schedule = await schedule.populate("nurse", "name role");

    res.status(201).json({
      message: "✅ Schedule created successfully.",
      schedule
    });
  } catch (err) {
    console.error("❌ Error creating schedule:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const getSchedules = async (req, res) => {
  const schedules = await Schedule.find()
    .populate("patient", "firstName lastName mrn")
    .populate("nurse", "name role");
  res.json(schedules);
};

export const getSchedule = async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate("patient")
    .populate("nurse");
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  res.json(schedule);
};

export const updateSchedule = async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  res.json(schedule);
};

export const deleteSchedule = async (req, res) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  res.json({ message: "Deleted" });
};


export const deleteAllSchedules = async (req, res) => {
  try {
    if (req.query.confirm !== "true") {
      return res.status(400).json({
        message: "Dangerous operation blocked. Add ?confirm=true to delete ALL schedules."
      });
    }

    const result = await Schedule.deleteMany({});
    return res.json({
      message: "🗑️ All schedule records deleted successfully.",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("❌ Error deleting all schedules:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
