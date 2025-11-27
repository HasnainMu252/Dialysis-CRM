import mongoose from "mongoose";

export const BedStatus = ["Available", "Busy", "UnderMaintenance"];
export const BedType = ["Standard", "ICU", "Isolation", "Pediatric"];

const bedSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  }, // e.g., "Bed 1", "ICU Bed A"
  number: { 
    type: String, 
    required: true, 
    unique: true 
  }, // e.g., "B001", "ICU001"
  type: { 
    type: String, 
    enum: BedType, 
    default: "Standard" 
  },
  status: { 
    type: String, 
    enum: BedStatus, 
    default: "Available" 
  },
  location: {
    ward: { type: String, default: "General" },
    room: String
  },
  equipment: [{
    name: String,
    status: { type: String, default: "Operational" },
    lastMaintenance: Date
  }],
  notes: String,
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Index for better query performance
bedSchema.index({ status: 1, type: 1 });
bedSchema.index({ number: 1 });

// Virtual for current patient (if any)
bedSchema.virtual('currentSchedule', {
  ref: 'Schedule',
  localField: '_id',
  foreignField: 'bed',
  justOne: true,
  match: { 
    status: { $in: ['Scheduled', 'InProgress'] },
    date: { $lte: new Date() }
  }
});

// Instance method to check if bed is available for scheduling
bedSchema.methods.isAvailableForSchedule = function(date, startTime, endTime, scheduleId = null) {
  if (this.status !== 'Available' && this.status !== 'Busy') {
    return false;
  }
  
  // Additional business logic can be added here
  return true;
};

// Static method to get available beds for a time slot
bedSchema.statics.getAvailableBeds = async function(date, startTime, endTime) {
  const Bed = this;
  const Schedule = mongoose.model('Schedule');
  
  // Find all active available beds
  const availableBeds = await Bed.find({ 
    status: 'Available', 
    isActive: true 
  });
  
  // Check for scheduling conflicts
  const bedsWithConflicts = await Schedule.find({
    date: new Date(date),
    $and: [
      { startTime: { $lt: endTime } },
      { endTime: { $gt: startTime } },
      { status: { $in: ['Scheduled', 'InProgress'] } }
    ]
  }).distinct('bed');
  
  // Filter out beds with conflicts
  return availableBeds.filter(bed => !bedsWithConflicts.includes(bed._id));
};

// Pre-save middleware to generate bed number if not provided
bedSchema.pre('save', async function(next) {
  if (this.isNew && !this.number) {
    const Bed = mongoose.model('Bed');
    const lastBed = await Bed.findOne({}, {}, { sort: { 'number': -1 } });
    
    if (lastBed && lastBed.number) {
      const lastNumber = parseInt(lastBed.number.replace(/\D/g, '')) || 0;
      this.number = `B${String(lastNumber + 1).padStart(3, '0')}`;
    } else {
      this.number = 'B001';
    }
  }
  next();
});

export default mongoose.model("Bed", bedSchema);