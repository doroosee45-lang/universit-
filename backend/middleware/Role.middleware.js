const { forbidden } = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

// Vérifie que l'utilisateur a l'un des rôles autorisés
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return forbidden(res, 'Non authentifié.');
    if (!roles.includes(req.user.role)) {
      return forbidden(res, `Rôle "${req.user.role}" non autorisé pour cette action.`);
    }
    next();
  };
};

// Raccourcis pratiques
const isAdmin = authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN);
const isSuperAdmin = authorize(ROLES.SUPER_ADMIN);
const isTeacher = authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN);
const isStudent = authorize(ROLES.STUDENT);
const isAdminOrTeacher = authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.DEPARTMENT_HEAD);
const isStaff = authorize(ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN);

// Vérifie que l'utilisateur accède à ses propres données ou est admin
const isSelfOrAdmin = (req, res, next) => {
  const targetId = req.params.id || req.params.studentId;
  const isOwnData = req.user._id.toString() === targetId;
  const isAdminUser = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role);

  if (!isOwnData && !isAdminUser) {
    return forbidden(res, 'Accès non autorisé à ces données.');
  }
  next();
};

module.exports = { authorize, isAdmin, isSuperAdmin, isTeacher, isStudent, isAdminOrTeacher, isStaff, isSelfOrAdmin };