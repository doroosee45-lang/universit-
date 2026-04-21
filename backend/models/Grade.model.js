const mongoose = require('mongoose');
const { ASSESSMENT_TYPES, EXAM_SESSIONS } = require('../config/constants');

const AssessmentSchema = new mongoose.Schema({
  type: { type: String, enum: Object.values(ASSESSMENT_TYPES), required: true },
  label: String, // ex: "CC1", "Examen Final S1"
  score: { type: Number, required: true, min: 0 },
  maxScore: { type: Number, default: 20 },
  weight: { type: Number, required: true }, // pourcentage ex: 40
  date: Date,
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enteredAt: { type: Date, default: Date.now }
});

const GradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ue: { type: mongoose.Schema.Types.ObjectId, ref: 'UE', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  session: { type: String, enum: Object.values(EXAM_SESSIONS), default: EXAM_SESSIONS.SESSION1 },
  assessments: [AssessmentSchema],
  
  // Calculé automatiquement
  average: { type: Number, default: 0, min: 0, max: 20 },
  mention: String,
  isValidated: { type: Boolean, default: false },
  ectsObtained: { type: Number, default: 0 },
  // Rattrapage session 2
  session2Score: { type: Number, min: 0, max: 20 },
  finalAverage: { type: Number, default: 0 },
  comment: String
}, { timestamps: true });

// Index pour recherche rapide
GradeSchema.index({ student: 1, ue: 1, academicYear: 1, session: 1 }, { unique: true });
GradeSchema.index({ student: 1, academicYear: 1 });
GradeSchema.index({ ue: 1, academicYear: 1 });

module.exports = mongoose.model('Grade', GradeSchema);