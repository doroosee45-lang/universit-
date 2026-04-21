const mongoose = require('mongoose');

const TranscriptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  semester: { type: String },
  // Détail des notes par UE
  ueGrades: [{
    ue: { type: mongoose.Schema.Types.ObjectId, ref: 'UE' },
    ueCode: String,
    ueTitle: String,
    coefficient: Number,
    credits: Number,
    average: Number,
    mention: String,
    isValidated: Boolean,
    ectsObtained: Number
  }],
  semesterAverage: Number,
  totalECTS: Number,
  mention: String,
  rank: Number,
  totalStudents: Number,
  generatedAt: { type: Date, default: Date.now },
  pdfUrl: String,
  qrCode: String,
  // Validation officielle
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isSigned: { type: Boolean, default: false }
}, { timestamps: true });

TranscriptSchema.index({ student: 1, academicYear: 1, semester: 1 });

module.exports = mongoose.model('Transcript', TranscriptSchema);