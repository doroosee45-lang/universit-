const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';

  // Log l'erreur
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Erreur Mongoose : ID invalide
  if (err.name === 'CastError') {
    message = `Ressource introuvable pour l'id: ${err.value}`;
    statusCode = 404;
  }

  // Erreur Mongoose : doublon (unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `La valeur "${err.keyValue[field]}" existe déjà pour le champ "${field}".`;
    statusCode = 400;
  }

  // Erreur Mongoose : validation
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join(', ');
    statusCode = 400;
  }

  // JWT invalide
  if (err.name === 'JsonWebTokenError') {
    message = 'Token invalide.';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expiré.';
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;