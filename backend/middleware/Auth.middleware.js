const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { unauthorized } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return unauthorized(res, 'Accès refusé. Token manquant.');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// ✅ NOUVEAU — à ajouter
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return unauthorized(res, 'Non authentifié.');
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Accès interdit. Rôle insuffisant.' });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize }; // ✅ authorize ajouté ici