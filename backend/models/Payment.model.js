const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  fee: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  method: {
    type: String,
    enum: ['cash', 'carte_bancaire', 'virement', 'cheque', 'ccp', 'autre'],
    required: true
  },
  transactionId: { type: String, unique: true, sparse: true },
  reference: String,
  receiptNumber: { type: String, unique: true },
  receiptUrl: String, // PDF généré
  paymentDate: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String
}, { timestamps: true });

PaymentSchema.index({ fee: 1 });
PaymentSchema.index({ student: 1 });
PaymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);