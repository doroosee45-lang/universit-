const mongoose = require('mongoose');

const InternshipSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  // Encadrants
  companyTutor: {
    name: String,
    position: String,
    email: String,
    phone: String
  },
  academicTutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Documents
  conventionUrl: String,
  reportUrl: String,
  // Évaluations
  companyScore: { type: Number, min: 0, max: 20 },
  academicScore: { type: Number, min: 0, max: 20 },
  finalScore: { type: Number, min: 0, max: 20 },
  // Soutenance
  defenseDate: Date,
  defenseRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  jury: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  juryReport: String,
  // Statut
  status: {
    type: String,
    enum: ['candidature', 'accepted', 'ongoing', 'report_submitted', 'defended', 'validated', 'failed'],
    default: 'candidature'
  },
  attestationUrl: String,
  notes: String
}, { timestamps: true });

InternshipSchema.index({ student: 1, academicYear: 1 });
InternshipSchema.index({ company: 1 });
InternshipSchema.index({ status: 1 });

module.exports = mongoose.model('Internship', InternshipSchema);