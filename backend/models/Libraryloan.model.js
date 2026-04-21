const mongoose = require('mongoose');

const LibraryLoanSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBook', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loanDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: Date,
  // Amendes
  finePerDay: { type: Number, default: 50 }, // en DA par jour
  fineAmount: { type: Number, default: 0 },
  isFinesPaid: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue', 'lost'],
    default: 'active'
  },
  renewalCount: { type: Number, default: 0 },
  maxRenewals: { type: Number, default: 1 },
  notes: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Calcul automatique de l'amende
LibraryLoanSchema.methods.calculateFine = function () {
  if (!this.returnDate && this.dueDate < new Date()) {
    const daysLate = Math.ceil((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
    this.fineAmount = daysLate * this.finePerDay;
  }
  return this.fineAmount;
};

LibraryLoanSchema.index({ student: 1, status: 1 });
LibraryLoanSchema.index({ book: 1 });
LibraryLoanSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('LibraryLoan', LibraryLoanSchema);