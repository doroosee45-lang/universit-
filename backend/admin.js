const mongoose = require('mongoose');
const User = require('./User.model');

// Admin
const AdminSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  department: String,
  permissions: [String] // permissions spécifiques supplémentaires
});

// Staff (Personnel administratif)
const StaffSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  position: {
    type: String,
    enum: ['scolarite', 'bibliotheque', 'finances', 'secretariat', 'informatique', 'autre'],
    default: 'secretariat'
  },
  department: String
});

const Admin = User.discriminator('admin', AdminSchema);
const Staff = User.discriminator('staff', StaffSchema);
const SuperAdmin = User.discriminator('super_admin', new mongoose.Schema({}));
const DepartmentHead = User.discriminator('department_head', new mongoose.Schema({
  department: String,
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' }
}));

module.exports = { Admin, Staff, SuperAdmin, DepartmentHead };




const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Admin, Staff, SuperAdmin, DepartmentHead } = require('../models');
const Program = require('../models/Program.model');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');
const { success, created, error, unauthorized, badRequest } = require('../utils/apiResponse');
const { generateToken } = require('../utils/helpers');

// Générer un JWT
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phone, address, dateOfBirth, gender, isActive, isEmailVerified } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return badRequest(res, 'Cet email est déjà utilisé.');

    const verificationToken = generateToken();
    
    // Préparer les données de base
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role: role || 'student',
      phone: phone || '',
      address: address || {},
      dateOfBirth: dateOfBirth || new Date('2000-01-01'),
      gender: gender || 'other',
      isActive: isActive !== undefined ? isActive : true,
      isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : false,
      emailVerificationToken: crypto.createHash('sha256').update(verificationToken).digest('hex')
    };
    
    // Si c'est un étudiant, ajouter les champs spécifiques
    if (userData.role === 'student') {
      let defaultProgram = await Program.findOne();
      if (!defaultProgram) {
        defaultProgram = await Program.create({
          code: 'DEFAULT',
          name: 'Programme Général',
          type: 'Licence',
          level: 'Licence',
          durationYears: 3,
          department: 'Général',
          academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
        });
      }
      userData.program = defaultProgram._id;
      userData.level = 'L1';
      userData.currentSemester = 'S1';
      userData.academicYear = new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);
      userData.enrollmentDate = new Date();
    }
    
    // ✅ IMPORTANT : Utiliser User.create() pour tous (le discriminator se fait automatiquement via role)
    const user = await User.create(userData);
    
    // Envoyer email de vérification (si pas déjà vérifié)
    if (!user.isEmailVerified) {
      await sendVerificationEmail(user, verificationToken);
    }
    
    return created(res, { id: user._id, email: user.email }, 'Compte créé avec succès.');
  } catch (err) {
    console.error('Erreur inscription:', err);
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    
    if (!user) {
      return unauthorized(res, 'Email ou mot de passe incorrect.');
    }

    if (user.isLocked === true) {
      return unauthorized(res, 'Compte temporairement verrouillé. Réessayez dans 2 heures.');
    }

    if (!user.isActive) {
      return unauthorized(res, 'Compte désactivé. Contactez l\'administration.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return unauthorized(res, 'Email ou mot de passe incorrect.');
    }

    await user.resetLoginAttempts();

    const token = signToken(user._id, user.role);
    
    return success(res, {
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    }, 'Connexion réussie.');
  } catch (err) {
    console.error('Erreur login:', err);
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return unauthorized(res, 'Utilisateur non trouvé');
    }
    return success(res, user, 'Profil récupéré');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return success(res, null, 'Si cet email existe, un lien de réinitialisation a été envoyé.');
    }

    const resetToken = generateToken();
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user, resetToken);
    return success(res, null, 'Email de réinitialisation envoyé.');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) return badRequest(res, 'Token invalide ou expiré.');

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id, user.role);
    return success(res, { token }, 'Mot de passe réinitialisé avec succès.');
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/verify-email/:token
const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ emailVerificationToken: hashedToken }).select('+emailVerificationToken');

    if (!user) return badRequest(res, 'Token de vérification invalide.');

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    return success(res, null, 'Email vérifié avec succès.');
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return badRequest(res, 'Mot de passe actuel incorrect.');

    user.password = newPassword;
    await user.save();

    return success(res, null, 'Mot de passe modifié avec succès.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, verifyEmail, changePassword };



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
module.exports = User;



const mongoose = require('mongoose');
const User = require('./User.model');

const TeacherSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  department: { type: String, required: true },
  title: {
    type: String,
    enum: ['Professeur', 'Maître de Conférences A', 'Maître de Conférences B',
      'Maître Assistant A', 'Maître Assistant B', 'Attaché d\'enseignement', 'Vacataire'],
    default: 'Maître Assistant A'
  },
  specialties: [String],
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  // UEs dont il est responsable
  responsibleUEs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UE' }],
  // Informations professionnelles
  hireDate: Date,
  contractType: {
    type: String,
    enum: ['permanent', 'contractuel', 'vacataire'],
    default: 'permanent'
  },
  office: String,
  bio: String,
  // Disponibilités
  availabilities: [{
    dayOfWeek: { type: Number, min: 0, max: 6 },
    startTime: String,
    endTime: String
  }]
});

TeacherSchema.index({ employeeId: 1 });
TeacherSchema.index({ department: 1 });

const Teacher = User.discriminator('teacher', TeacherSchema);
module.exports = Teacher;


const mongoose = require('mongoose');
const User = require('./User.model');
const { STUDENT_STATUS, LEVELS, SEMESTERS, ROLES } = require('../config/constants');

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true },
  ine: { type: String, unique: true, sparse: true }, // Identifiant National Étudiant
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  level: { type: String, enum: LEVELS, required: true },
  currentSemester: { type: String, enum: SEMESTERS, required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, enum: Object.values(STUDENT_STATUS), default: STUDENT_STATUS.ACTIVE },
  academicYear: { type: String, required: true }, // ex: "2024-2025"
  // Documents personnels
  documents: [{
    type: { type: String },
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Infos supplémentaires
  dateOfBirth: Date,
  placeOfBirth: String,
  nationality: { type: String, default: 'Algérienne' },
  // Tuteur / Parent
  guardian: {
    name: String,
    phone: String,
    email: String,
    relation: String
  },
  // Carte étudiant numérique
  studentCardUrl: String,
  notes: String // Notes administratives
});

StudentSchema.index({ studentId: 1 });
StudentSchema.index({ program: 1, level: 1 });
StudentSchema.index({ status: 1 });

const Student = User.discriminator('student', StudentSchema);
module.exports = Student;



const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  academicYear: { type: String, required: true, unique: true },
  currentSemester: String,
  isActive: { type: Boolean, default: false },
  // Informations établissement
  schoolInfo: {
    name: String,
    arabicName: String,
    logo: String,
    address: String,
    phone: String,
    email: String,
    website: String,
    rector: String
  },
  // Calendrier académique
  semesterDates: [{
    semester: String,
    startDate: Date,
    endDate: Date,
    examStartDate: Date,
    examEndDate: Date
  }],
  // Barème de notation
  gradingScale: {
    passingGrade: { type: Number, default: 10 },
    maxGrade: { type: Number, default: 20 }
  },
  // Structure des frais par filière/niveau
  feeStructure: [{
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    level: String,
    inscriptionFee: { type: Number, default: 0 },
    scolarityFee: { type: Number, default: 0 },
    cvec: { type: Number, default: 0 },
    otherFees: [{ label: String, amount: Number }]
  }],
  // Jours fériés
  holidays: [{
    name: String,
    date: Date
  }],
  // Paramètres absences
  attendanceSettings: {
    maxAbsencePercentage: { type: Number, default: 25 },
    alertThreshold: { type: Number, default: 20 },
    lateToleranceMinutes: { type: Number, default: 15 }
  },
  // Bibliothèque
  librarySettings: {
    maxLoanDays: { type: Number, default: 14 },
    maxRenewals: { type: Number, default: 1 },
    finePerDay: { type: Number, default: 50 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);


const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { unauthorized } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return unauthorized(res, 'Accès refusé. Token manquant.');
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur (pas besoin de +isActive)
    const user = await User.findById(decoded.id);
    
    if (!user) return unauthorized(res, 'Utilisateur introuvable.');
    if (!user.isActive) return unauthorized(res, 'Compte désactivé.');

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return unauthorized(res, 'Token invalide.');
    if (error.name === 'TokenExpiredError') return unauthorized(res, 'Token expiré. Reconnectez-vous.');
    next(error);
  }
};

// Middleware optionnel
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
    next();
  } catch {
    next();
  }
};

module.exports = { protect, optionalAuth };



const { validationResult } = require('express-validator');
const { badRequest } = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return badRequest(res, 'Données invalides.', errors.array().map(e => ({
      field: e.path,
      message: e.msg
    })));
  }
  next();
};

module.exports = { validate };


const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, verifyEmail, changePassword } = require('../controller/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.put('/change-password', protect, changePassword);

module.exports = router;