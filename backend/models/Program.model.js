const mongoose = require('mongoose');
const { LEVELS } = require('../config/constants');

const ProgramSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: {
    type: String,
    enum: ['Licence', 'Master', 'Doctorat', 'BUT', 'BTS', 'Ingénieur', 'Autre'],
    required: true
  },
  department: { type: String, required: true },
  description: String,
  levels: [{ type: String, enum: LEVELS }],
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  maxCapacity: { type: Number, default: 30 },
  academicYear: { type: String, required: true },
  duration: { type: Number, default: 6 }, // nombre de semestres
  isActive: { type: Boolean, default: true },
  objectives: String,
  // Spécialités / options
  specialties: [{ name: String, code: String }]
}, { timestamps: true });

ProgramSchema.index({ code: 1 });
ProgramSchema.index({ department: 1 });

module.exports = mongoose.model('Program', ProgramSchema);