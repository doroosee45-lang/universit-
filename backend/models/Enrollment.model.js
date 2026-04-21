const mongoose = require('mongoose');
const { SEMESTERS } = require('../config/constants');

const EnrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ue: { type: mongoose.Schema.Types.ObjectId, ref: 'UE', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, enum: SEMESTERS, required: true },
  group: { type: String }, // ex: G1, G2
  status: {
    type: String,
    enum: ['enrolled', 'validated', 'failed', 'withdrawn'],
    default: 'enrolled'
  },
  enrollmentDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Un étudiant ne peut s'inscrire qu'une fois par UE par année
EnrollmentSchema.index({ student: 1, ue: 1, academicYear: 1 }, { unique: true });
EnrollmentSchema.index({ student: 1, academicYear: 1 });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);