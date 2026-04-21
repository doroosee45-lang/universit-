const mongoose = require('mongoose');

const jurySchema = new mongoose.Schema({
  academicYear: { type: String, required: true },
  session: { type: String, enum: ['principale', 'rattrapage'], required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Jury', jurySchema);