const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const Student = require('../models/Student.model');
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
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return badRequest(res, 'Cet email est déjà utilisé.');

    const verificationToken = generateToken();

    const userData = {
      firstName,
      lastName,
      email,
      password,
      role: role || 'student',
      emailVerificationToken: crypto.createHash('sha256').update(verificationToken).digest('hex')
    };

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
      // ✅ studentId sera auto-généré par le pre-save hook dans Student.model.js
    }

    const user = await User.create(userData);

    await sendVerificationEmail(user, verificationToken);
    return created(res, { id: user._id, email: user.email }, 'Compte créé. Vérifiez votre email.');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    console.log('Email reçu:', email);
    console.log('Utilisateur trouvé:', user ? user.email : 'NON');

    if (!user) return unauthorized(res, 'Email ou mot de passe incorrect.');

    if (user.isLocked === true) {
      console.log('Compte verrouillé jusqu\'au:', user.lockUntil);
      return unauthorized(res, 'Compte temporairement verrouillé. Réessayez dans 2 heures.');
    }

    if (!user.isActive) return unauthorized(res, 'Compte désactivé. Contactez l\'administration.');

    const isMatch = await user.comparePassword(password);
    console.log('Mot de passe valide:', isMatch);

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
    const user = await User.findById(req.user._id).populate('program', 'name code');
    return success(res, user);
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