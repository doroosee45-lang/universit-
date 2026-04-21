const mongoose = require('mongoose');

const deliberationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  academicYear: { type: String, required: true },
  session: { type: String, enum: ['principale', 'rattrapage'], default: 'principale' },
  generalAverage: { type: Number, required: true },
  mention: { type: String, enum: ['Passable', 'Assez Bien', 'Bien', 'Très Bien', 'Non validé'] },
  validated: { type: Boolean, default: false },
  validatedAt: { type: Date },
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String },
  certificateGenerated: { type: Boolean, default: false },
  certificateNumber: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deliberation', deliberationSchema);