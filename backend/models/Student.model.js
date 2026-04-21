const mongoose = require('mongoose');
const User = require('./User.model');
const { STUDENT_STATUS, LEVELS, SEMESTERS } = require('../config/constants');

const StudentSchema = new mongoose.Schema({
  // ✅ sparse: true permet plusieurs documents sans studentId (null/undefined)
  studentId: { type: String, unique: true, sparse: true },
  ine: { type: String, unique: true, sparse: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  level: { type: String, enum: LEVELS, required: true },
  currentSemester: { type: String, enum: SEMESTERS, required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, enum: Object.values(STUDENT_STATUS), default: STUDENT_STATUS.ACTIVE },
  academicYear: { type: String, required: true },
  documents: [{
    type: { type: String },
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  dateOfBirth: Date,
  placeOfBirth: String,
  nationality: { type: String, default: 'Algérienne' },
  guardian: {
    name: String,
    phone: String,
    email: String,
    relation: String
  },
  studentCardUrl: String,
  notes: String
});

// ✅ Auto-générer studentId avant sauvegarde s'il est absent
StudentSchema.pre('save', async function (next) {
  if (!this.studentId) {
    const year = new Date().getFullYear();
    // Compter les étudiants existants pour la séquence
    const count = await mongoose.model('student').countDocuments();
    this.studentId = `STU${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

StudentSchema.index({ studentId: 1 });
StudentSchema.index({ program: 1, level: 1 });
StudentSchema.index({ status: 1 });

const Student = User.discriminator('student', StudentSchema);
module.exports = Student;