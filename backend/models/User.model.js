const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, MAX_LOGIN_ATTEMPTS, LOCK_TIME } = require('../config/constants');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: Object.values(ROLES), required: true },
  phone: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    wilaya: String,
    postalCode: String
  },
  profilePhoto: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  loginAttempts: { type: Number, default: 0, select: false },
  lockUntil: { type: Date, select: false },
  lastLogin: { type: Date },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false }
}, {
  timestamps: true,
  discriminatorKey: 'role'
});

// Index
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Virtual : nom complet
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual : compte verrouillé ?
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash du mot de passe avant sauvegarde
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Méthode : comparer mot de passe
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode : incrémenter tentatives de connexion
UserSchema.methods.incLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.updateOne(updates);
};

// Méthode : réinitialiser tentatives après connexion réussie
UserSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 }
  });
};

// Ne pas retourner le mot de passe dans JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  delete obj.twoFactorSecret;
  return obj;
};

const User = mongoose.model('User', UserSchema);

// ============================================
// ✅ DISCRIMINATORS - CRÉATION IMMÉDIATE
// ============================================

// Admin Schema
const AdminSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, sparse: true },
  department: { type: String, default: 'Administration' },
  permissions: { type: [String], default: [] }
}, { _id: false });

// Staff Schema
const StaffSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, sparse: true },
  position: {
    type: String,
    enum: ['scolarite', 'bibliotheque', 'finances', 'secretariat', 'informatique', 'autre'],
    default: 'secretariat'
  },
  department: { type: String, default: 'Administratif' }
}, { _id: false });

// ✅ SUPER ADMIN Schema - AVEC UN CHAMP (pas vide)
const SuperAdminSchema = new mongoose.Schema({
  superAdminLevel: { type: Number, default: 1 },
  systemAccess: { type: [String], default: ['all'] },
  masterKey: { type: String, select: false, default: null }
}, { _id: false });

// DepartmentHead Schema
const DepartmentHeadSchema = new mongoose.Schema({
  department: { type: String, required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' }
}, { _id: false });

// ✅ CRÉATION DES DISCRIMINATORS
try {
  const Admin = User.discriminator('admin', AdminSchema);
  const Staff = User.discriminator('staff', StaffSchema);
  const SuperAdmin = User.discriminator('super_admin', SuperAdminSchema);
  const DepartmentHead = User.discriminator('department_head', DepartmentHeadSchema);
  
  console.log('✅ Discriminators créés avec succès');
  console.log('   - admin');
  console.log('   - staff'); 
  console.log('   - super_admin');
  console.log('   - department_head');
  
  module.exports = User;
  module.exports.Admin = Admin;
  module.exports.Staff = Staff;
  module.exports.SuperAdmin = SuperAdmin;
  module.exports.DepartmentHead = DepartmentHead;
  
} catch (error) {
  console.error('❌ Erreur création discriminators:', error.message);
  module.exports = User;
}