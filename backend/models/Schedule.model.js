const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: String, required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  group: String, // G1, G2 pour TD/TP
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0=Dim, 1=Lun...6=Sam
  startTime: { type: String, required: true }, // ex: "08:00"
  endTime: { type: String, required: true },   // ex: "10:00"
  // Dates effectives (pour les cours ponctuels ou modifications)
  startDate: Date,
  endDate: Date,
  isRecurring: { type: Boolean, default: true },
  // Exceptions (cours annulé, déplacé)
  exceptions: [{
    date: Date,
    reason: String,
    newRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    newStartTime: String,
    newEndTime: String,
    isCancelled: { type: Boolean, default: false }
  }],
  notes: String
}, { timestamps: true });

ScheduleSchema.index({ program: 1, semester: 1, academicYear: 1 });
ScheduleSchema.index({ teacher: 1, academicYear: 1 });
ScheduleSchema.index({ room: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Schedule', ScheduleSchema);



















// const mongoose = require('mongoose');

// const scheduleSchema = new mongoose.Schema({
//   course: { type: String, required: true },
//   teacher: { type: String, required: true },
//   program: { type: String, default: '' },        // ex: "Informatique L2"
//   semester: { type: String, enum: ['S1','S2','S3','S4','S5','S6'], required: true },
//   group: { type: String, default: '' },
//   room: { type: String, default: '' },
//   day: { type: Number, min: 0, max: 6, required: true }, // 0=Lundi, 6=Dimanche (ou selon préférence)
//   start: { type: String, required: true },        // HH:MM
//   end: { type: String, required: true },
//   year: { type: String, required: true },         // Année académique ex: "2024-2025"
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Schedule', scheduleSchema);