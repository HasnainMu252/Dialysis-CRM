import mongoose from "mongoose";

export const ScheduleStatus = ["Scheduled", "InProgress", "Completed", "Cancelled"];

const scheduleSchema = new mongoose.Schema({
  patientMrn: { 
    type: String, 
    ref: "Patient", 
    required: true 
  },
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Patient", 
    required: true 
  },
  bed: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Bed", 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  startTime: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ScheduleStatus, 
    default: "Scheduled" 
  },
  cancel: {
    requested: { 
      type: Boolean, 
      default: false 
    },
    approved: { 
      type: Boolean, 
      default: false 
    },
    reason: { 
      type: String 
    }
  }
}, { timestamps: true });

// Updated index to include patientMrn for better query performance
scheduleSchema.index({ patientMrn: 1, date: 1 });
scheduleSchema.index({ bed: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

// Pre-save middleware to ensure patientMrn is populated
scheduleSchema.pre('save', async function(next) {
  if (this.isNew && this.patient && !this.patientMrn) {
    try {
      const Patient = mongoose.model('Patient');
      const patient = await Patient.findById(this.patient);
      if (patient) {
        this.patientMrn = patient.mrn;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.model("Schedule", scheduleSchema);