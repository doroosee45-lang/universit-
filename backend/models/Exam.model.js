const mongoose = require('mongoose');
const { EXAM_SESSIONS } = require('../config/constants');

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ue: { type: mongoose.Schema.Types.ObjectId, ref: 'UE', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  session: { type: String, enum: Object.values(EXAM_SESSIONS), required: true },
  type: {
    type: String,
    enum: ['partiel', 'final', 'rattrapage', 'tp', 'oral', 'projet'],
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number }, // en minutes
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  // Surveillants
  supervisors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  groups: [String],
  maxScore: { type: Number, default: 20 },
  coefficient: Number,
  instructions: String,
  isPublished: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['planned', 'ongoing', 'completed', 'cancelled'],
    default: 'planned'
  },
  // PV de délibération
  deliberationDate: Date,
  deliberationNotes: String
}, { timestamps: true });

ExamSchema.index({ ue: 1, academicYear: 1, session: 1 });
ExamSchema.index({ program: 1, startDate: 1 });

module.exports = mongoose.model('Exam', ExamSchema);