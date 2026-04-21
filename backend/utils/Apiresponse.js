// Formatage standardisé des réponses API

const success = (res, data = null, message = 'Succès', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const created = (res, data = null, message = 'Créé avec succès') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'Une erreur est survenue', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

const notFound = (res, message = 'Ressource non trouvée') => {
  return error(res, message, 404);
};

const unauthorized = (res, message = 'Non autorisé') => {
  return error(res, message, 401);
};

const forbidden = (res, message = 'Accès interdit') => {
  return error(res, message, 403);
};

const badRequest = (res, message = 'Requête invalide', errors = null) => {
  return error(res, message, 400, errors);
};

const paginated = (res, data, total, page, limit, message = 'Succès') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
};
// Remplace la dernière ligne du fichier par ceci :
module.exports = { 
  success, 
  created, 
  error, 
  notFound, 
  unauthorized, 
  forbidden, 
  badRequest, 
  paginated,
  // Alias pour les controllers
  successResponse: success,
  errorResponse: error,
  paginatedResponse: paginated
};