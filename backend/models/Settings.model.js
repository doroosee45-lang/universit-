const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  academicYear: { type: String, required: true, unique: true },
  currentSemester: String,
  isActive: { type: Boolean, default: false },
  // Informations établissement
  schoolInfo: {
    name: String,
    arabicName: String,
    logo: String,
    address: String,
    phone: String,
    email: String,
    website: String,
    rector: String
  },
  // Calendrier académique
  semesterDates: [{
    semester: String,
    startDate: Date,
    endDate: Date,
    examStartDate: Date,
    examEndDate: Date
  }],
  // Barème de notation
  gradingScale: {
    passingGrade: { type: Number, default: 10 },
    maxGrade: { type: Number, default: 20 }
  },
  // Structure des frais par filière/niveau
  feeStructure: [{
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    level: String,
    inscriptionFee: { type: Number, default: 0 },
    scolarityFee: { type: Number, default: 0 },
    cvec: { type: Number, default: 0 },
    otherFees: [{ label: String, amount: Number }]
  }],
  // Jours fériés
  holidays: [{
    name: String,
    date: Date
  }],
  // Paramètres absences
  attendanceSettings: {
    maxAbsencePercentage: { type: Number, default: 25 },
    alertThreshold: { type: Number, default: 20 },
    lateToleranceMinutes: { type: Number, default: 15 }
  },
  // Bibliothèque
  librarySettings: {
    maxLoanDays: { type: Number, default: 14 },
    maxRenewals: { type: Number, default: 1 },
    finePerDay: { type: Number, default: 50 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);