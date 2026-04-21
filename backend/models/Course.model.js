const mongoose = require('mongoose');
const { COURSE_TYPES, SEMESTERS } = require('../config/constants');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: Object.values(COURSE_TYPES), required: true },
  ue: { type: mongoose.Schema.Types.ObjectId, ref: 'UE', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  semester: { type: String, enum: SEMESTERS, required: true },
  academicYear: { type: String, required: true },
  // Groupes concernés (ex: G1, G2 pour TD/TP)
  groups: [String],
  // Volume horaire total
  totalHours: { type: Number, default: 0 },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

CourseSchema.index({ ue: 1 });
CourseSchema.index({ teacher: 1 });
CourseSchema.index({ program: 1, semester: 1 });

module.exports = mongoose.model('Course', CourseSchema);