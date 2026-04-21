const mongoose = require('mongoose');

const DiplomaSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  diplomaNumber: { type: String, unique: true, required: true },
  graduationDate: { type: Date, required: true },
  academicYear: { type: String, required: true },
  generalAverage: { type: Number, required: true },
  mention: { type: String, required: true },
  totalECTS: Number,
  // Validation
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validatedAt: Date,
  // Documents
  pdfUrl: String,
  qrCodeUrl: String, // QR pour vérification
  // Supplément au diplôme
  diplomaSupplement: String,
  isIssued: { type: Boolean, default: false },
  issuedAt: Date,
  notes: String
}, { timestamps: true });

DiplomaSchema.index({ diplomaNumber: 1 });
DiplomaSchema.index({ student: 1 });

module.exports = mongoose.model('Diploma', DiplomaSchema);