const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../config/constants');

const FeeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academicYear: { type: String, required: true },
  // Détail des frais
  items: [{
    category: {
      type: String,
      enum: ['inscription', 'scolarite', 'bibliotheque', 'laboratoire', 'stage', 'soutenance', 'cvec', 'autre'],
      required: true
    },
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: Date,
    isPaid: { type: Boolean, default: false }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  remainingAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  // Bourse / Exonération
  scholarshipAmount: { type: Number, default: 0 },
  isExempted: { type: Boolean, default: false },
  exemptionReason: String,
  // Dates
  lastPaymentDate: Date,
  notes: String
}, { timestamps: true });

// Calcul automatique du restant dû
FeeSchema.pre('save', function (next) {
  this.remainingAmount = Math.max(0, this.totalAmount - this.paidAmount - this.scholarshipAmount);
  if (this.remainingAmount === 0) this.status = PAYMENT_STATUS.PAID;
  else if (this.paidAmount > 0) this.status = PAYMENT_STATUS.PARTIAL;
  next();
});

FeeSchema.index({ student: 1, academicYear: 1 }, { unique: true });
FeeSchema.index({ status: 1 });

module.exports = mongoose.model('Fee', FeeSchema);