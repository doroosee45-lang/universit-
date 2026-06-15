const crypto = require('crypto');

/**
 * Génère un ID étudiant unique (ex: STU2024001)
 */
const generateStudentId = (year, sequence) => {
  return `STU${year}${String(sequence).padStart(4, '0')}`;
};

/**
 * Génère un ID enseignant (ex: ENS2024001)
 */
const generateTeacherId = (year, sequence) => {
  return `ENS${year}${String(sequence).padStart(4, '0')}`;
};

/**
 * Génère un token aléatoire sécurisé
 */
const generateToken = (size = 32) => {
  return crypto.randomBytes(size).toString('hex');
};

/**
 * Génère un numéro de diplôme
 */
const generateDiplomaNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `DIP-${year}-${random}`;
};

/**
 * Formate une date en français
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

/**
 * Calcule l'année académique courante (ex: "2024-2025")
 */
const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

/**
 * Pagination helper
 */
const getPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Construit un filtre de recherche MongoDB
 */
const buildSearchFilter = (searchTerm, fields) => {
  if (!searchTerm) return {};
  const regex = new RegExp(searchTerm, 'i');
  return { $or: fields.map(field => ({ [field]: regex })) };
};

module.exports = {
  generateStudentId,
  generateTeacherId,
  generateToken,
  generateDiplomaNumber,
  formatDate,
  getCurrentAcademicYear,
  getPagination,
  buildSearchFilter
};