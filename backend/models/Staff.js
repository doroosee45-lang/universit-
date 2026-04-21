const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
  },
  department: {
    type: String,
    trim: true,
    default: '',
  },
  position: {
    type: String,
    enum: ['scolarite', 'bibliotheque', 'finances', 'secretariat', 'informatique', 'autre'],
    default: 'secretariat',
  },
  role: {
    type: String,
    enum: ['staff', 'admin'],
    default: 'staff',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
  },
  profilePhoto: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Hash password avant sauvegarde
staffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Générer employeeId automatiquement
staffSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Staff').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Méthode pour comparer mot de passe
staffSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Staff', staffSchema);