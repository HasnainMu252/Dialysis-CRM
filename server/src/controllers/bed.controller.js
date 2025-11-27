import Bed, { BedStatus } from "../models/bed.model.js";
import Schedule from "../models/schedule.model.js";

// Create bed (Admin)
export const createBed = async (req, res) => {
  try {
    const { name, type, location, equipment, notes } = req.body;

    // Check for duplicate bed name or number
    const existingBed = await Bed.findOne({
      $or: [{ name }, { number: req.body.number }]
    });
    
    if (existingBed) {
      return res.status(400).json({
        success: false,
        message: "Bed with this name or number already exists"
      });
    }

    const bed = await Bed.create(req.body);
    
    res.status(201).json({
      success: true,
      message: "Bed created successfully",
      bed
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// List all beds with current status and patient information
export const getBeds = async (req, res) => {
  try {
    const { status, type, available } = req.query;
    const filter = { isActive: true };

    if (status) filter.status = status;
    if (type) filter.type = type;

    let beds = await Bed.find(filter).sort({ number: 1 });

    // If available filter is requested
    if (available === 'true') {
      const { date, startTime, endTime } = req.query;
      if (date && startTime && endTime) {
        beds = await getAvailableBedsForTimeSlot(date, startTime, endTime);
      } else {
        beds = beds.filter(bed => bed.status === 'Available');
      }
    }

    // Get current patient information for each bed
    const bedsWithPatientInfo = await Promise.all(
      beds.map(async (bed) => {
        const currentSchedule = await Schedule.findOne({
          bed: bed._id,
          status: { $in: ['Scheduled', 'InProgress'] },
          date: { $lte: new Date() }
        })
        .populate('patient', 'firstName lastName mrn phone')
        .sort({ date: -1, startTime: -1 });

        return {
          ...bed.toObject(),
          currentPatient: currentSchedule ? {
            mrn: currentSchedule.patient.mrn,
            firstName: currentSchedule.patient.firstName,
            lastName: currentSchedule.patient.lastName,
            phone: currentSchedule.patient.phone,
            scheduleTime: currentSchedule.startTime + ' - ' + currentSchedule.endTime
          } : null
        };
      })
    );

    res.json({
      success: true,
      beds: bedsWithPatientInfo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get bed by ID with detailed information
export const getBed = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found"
      });
    }

    // Get current and upcoming schedules for this bed
    const schedules = await Schedule.find({
      bed: bed._id,
      date: { $gte: new Date() }
    })
    .populate('patient', 'firstName lastName mrn phone')
    .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      bed: {
        ...bed.toObject(),
        upcomingSchedules: schedules
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update bed (status, name, notes)
export const updateBed = async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found"
      });
    }

    // If bed status is changed to UnderMaintenance, cancel future schedules
    if (req.body.status === 'UnderMaintenance') {
      await cancelFutureSchedulesForBed(bed._id);
    }

    res.json({
      success: true,
      message: "Bed updated successfully",
      bed
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete bed (soft delete)
export const deleteBed = async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!bed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found"
      });
    }

    // Cancel all future schedules for this bed
    await cancelFutureSchedulesForBed(bed._id);

    res.json({
      success: true,
      message: "Bed deactivated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Bed availability check for a date & time range
export const getBedAvailability = async (req, res) => {
  try {
    const { date, start, end } = req.query;
    
    if (!date || !start || !end) {
      return res.status(400).json({ 
        success: false,
        message: "date, start, and end parameters are required" 
      });
    }

    const [y, m, d] = date.split("-").map(Number);
    const day = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));

    // Validate time format
    const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!TIME_RE.test(start) || !TIME_RE.test(end)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format. Use HH:MM format"
      });
    }

    const schedules = await Schedule.find({ 
      date: day,
      status: { $in: ['Scheduled', 'InProgress'] }
    });

    const toMin = (t) => {
      const [H, M] = t.split(":").map(Number);
      return H * 60 + M;
    };

    const reqS = toMin(start),
      reqE = toMin(end);

    if (reqS >= reqE) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time"
      });
    }

    const beds = await Bed.find({ isActive: true }).sort({ number: 1 }).lean();
    
    const result = beds.map((bed) => {
      const clashes = schedules
        .filter((s) => String(s.bed) === String(bed._id))
        .some((s) => {
          const sS = toMin(s.startTime),
            sE = toMin(s.endTime);
          // Check for time overlap
          return !(reqE <= sS || reqS >= sE);
        });
      
      return { 
        ...bed, 
        isAvailable: !clashes && bed.status === 'Available',
        status: clashes ? 'Booked' : bed.status
      };
    });

    res.json({
      success: true,
      date: day.toISOString().split('T')[0],
      timeSlot: `${start} - ${end}`,
      availableBeds: result.filter(bed => bed.isAvailable),
      allBeds: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get beds by status
export const getBedsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!BedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${BedStatus.join(', ')}`
      });
    }

    const beds = await Bed.find({ 
      status, 
      isActive: true 
    }).sort({ number: 1 });

    res.json({
      success: true,
      status,
      count: beds.length,
      beds
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to get available beds for a time slot
const getAvailableBedsForTimeSlot = async (date, startTime, endTime) => {
  const beds = await Bed.find({ 
    status: 'Available', 
    isActive: true 
  });
  
  const schedules = await Schedule.find({
    date: new Date(date),
    $and: [
      { startTime: { $lt: endTime } },
      { endTime: { $gt: startTime } },
      { status: { $in: ['Scheduled', 'InProgress'] } }
    ]
  });

  const busyBedIds = schedules.map(s => s.bed.toString());
  
  return beds.filter(bed => !busyBedIds.includes(bed._id.toString()));
};

// Helper function to cancel future schedules for a bed
const cancelFutureSchedulesForBed = async (bedId) => {
  await Schedule.updateMany(
    {
      bed: bedId,
      date: { $gte: new Date() },
      status: { $in: ['Scheduled', 'InProgress'] }
    },
    {
      status: 'Cancelled',
      cancel: {
        requested: true,
        approved: true,
        reason: 'Bed unavailable'
      }
    }
  );
};