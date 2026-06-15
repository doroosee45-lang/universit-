const mongoose = require('mongoose');
const { SEMESTERS } = require('../config/constants');

const UESchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  title: { type: String, required: true, trim: true },
  coefficient: { type: Number, required: true, min: 1, max: 10 },
  credits: { type: Number, required: true, min: 1, max: 12 }, // ECTS
  semester: { type: String, enum: SEMESTERS, required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  responsibleTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  // Volume horaire
  volumeHours: {
    cm: { type: Number, default: 1 }, // Cours Magistral
    td: { type: Number, default: 1 }, // Travaux Dirigés
    tp: { type: Number, default: 1 }  // Travaux Pratiques
  },
  isActive: { type: Boolean, default: true },
  // Répartition des évaluations
  evaluationWeights: {
    cc: { type: Number, default: 40 },     // Contrôle Continu %
    partiel: { type: Number, default: 20 }, // Examen Partiel %
    final: { type: Number, default: 40 }    // Examen Final %
  }
}, { timestamps: true });

UESchema.index({ code: 1 });
UESchema.index({ program: 1, semester: 1 });

module.exports = mongoose.model('UE', UESchema);