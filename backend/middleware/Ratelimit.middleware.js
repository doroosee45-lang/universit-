// const rateLimit = require('express-rate-limit');

// // Limiteur global
// const globalLimiter = rateLimit({
//   windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
//   max: process.env.RATE_LIMIT_MAX || 100,
//   message: { success: false, message: 'Trop de requêtes. Réessayez dans quelques minutes.' },
//   standardHeaders: true,
//   legacyHeaders: false
// });

// // Limiteur strict pour l'authentification
// const authLimiter = rateLimit({
//   windowMs: 25 * 60 * 1000, // 25 minutes
//   max: 10,
//   message: { success: false, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' }
// });

// // Limiteur pour la création de compte
// const registerLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 heure
//   max: 5,
//   message: { success: false, message: 'Trop de créations de compte. Réessayez plus tard.' }
// });

// // Limiteur pour les exports PDF/Excel
// const exportLimiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 10,
//   message: { success: false, message: 'Trop d\'exports. Attendez une minute.' }
// });

// module.exports = { globalLimiter, authLimiter, registerLimiter, exportLimiter };





const rateLimit = require('express-rate-limit');

// Limiteur global - 50 minutes
const globalLimiter = rateLimit({
  windowMs: 50 * 60 * 1000, // 50 minutes
  max: process.env.RATE_LIMIT_MAX || 100,
  message: { success: false, message: 'Trop de requêtes. Réessayez dans 50 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Limiteur strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 25 * 60 * 1000, // 25 minutes
  max: 10,
  message: { success: false, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' }
});

// Limiteur pour la création de compte
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,
  message: { success: false, message: 'Trop de créations de compte. Réessayez plus tard.' }
});

// Limiteur pour les exports PDF/Excel
const exportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, message: 'Trop d\'exports. Attendez une minute.' }
});

module.exports = { globalLimiter, authLimiter, registerLimiter, exportLimiter };