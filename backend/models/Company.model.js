const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sector: String,
  address: {
    street: String,
    city: String,
    wilaya: String,
    postalCode: String
  },
  phone: String,
  email: String,
  website: String,
  // Contact principal pour les stages
  contact: {
    name: String,
    position: String,
    phone: String,
    email: String
  },
  description: String,
  isActive: { type: Boolean, default: true },
  // Historique des stages
  totalInterns: { type: Number, default: 0 }
}, { timestamps: true });

CompanySchema.index({ name: 'text' });

module.exports = mongoose.model('Company', CompanySchema);