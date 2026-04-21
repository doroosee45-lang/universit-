const mongoose = require('mongoose');

const ScholarshipSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['bourse_etat', 'bourse_excellence', 'aide_sociale', 'exoneration', 'autre'],
    required: true
  },
  label: String,
  percentage: { type: Number, min: 0, max: 100 }, // % de réduction
  amount: { type: Number, min: 0 }, // montant fixe
  academicYear: { type: String, required: true },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  document: String, // URL justificatif
  notes: String
}, { timestamps: true });

ScholarshipSchema.index({ student: 1, academicYear: 1 });

module.exports = mongoose.model('Scholarship', ScholarshipSchema);