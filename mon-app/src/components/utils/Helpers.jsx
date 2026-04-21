// // export const getMention = (avg) => {
// //   if (avg >= 18) return { label: 'Excellent', color: 'text-purple-600', bg: 'bg-purple-100' };
// //   if (avg >= 16) return { label: 'Très Bien', color: 'text-blue-600', bg: 'bg-blue-100' };
// //   if (avg >= 14) return { label: 'Bien', color: 'text-green-600', bg: 'bg-green-100' };
// //   if (avg >= 12) return { label: 'Assez Bien', color: 'text-teal-600', bg: 'bg-teal-100' };
// //   if (avg >= 10) return { label: 'Passable', color: 'text-yellow-600', bg: 'bg-yellow-100' };
// //   return { label: 'Ajourné', color: 'text-red-600', bg: 'bg-red-100' };
// // };

// // export const getRoleLabel = (role) => ({
// //   super_admin: 'Super Admin',
// //   admin: 'Administrateur',
// //   teacher: 'Enseignant',
// //   student: 'Étudiant',
// //   staff: 'Personnel',
// //   department_head: 'Chef Département',
// // }[role] || role);

// // export const getRoleColor = (role) => ({
// //   super_admin: 'bg-purple-100 text-purple-700',
// //   admin: 'bg-blue-100 text-blue-700',
// //   teacher: 'bg-green-100 text-green-700',
// //   student: 'bg-yellow-100 text-yellow-700',
// //   staff: 'bg-gray-100 text-gray-700',
// //   department_head: 'bg-indigo-100 text-indigo-700',
// // }[role] || 'bg-gray-100 text-gray-700');

// // export const getStatusColor = (status) => ({
// //   active: 'bg-green-100 text-green-700',
// //   inactive: 'bg-gray-100 text-gray-700',
// //   suspended: 'bg-orange-100 text-orange-700',
// //   expelled: 'bg-red-100 text-red-700',
// //   graduated: 'bg-blue-100 text-blue-700',
// //   pending: 'bg-yellow-100 text-yellow-700',
// //   paid: 'bg-green-100 text-green-700',
// //   partial: 'bg-orange-100 text-orange-700',
// //   overdue: 'bg-red-100 text-red-700',
// //   planned: 'bg-blue-100 text-blue-700',
// //   ongoing: 'bg-green-100 text-green-700',
// //   completed: 'bg-gray-100 text-gray-700',
// //   cancelled: 'bg-red-100 text-red-700',
// // }[status] || 'bg-gray-100 text-gray-700');

// // export const formatDate = (date) => {
// //   if (!date) return '—';
// //   return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
// // };

// // export const formatDateTime = (date) => {
// //   if (!date) return '—';
// //   return new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
// // };

// // export const formatCurrency = (amount) => {
// //   if (amount == null) return '—';
// //   return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(amount);
// // };

// // export const getInitials = (firstName, lastName) => {
// //   return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
// // };

// // export const getCurrentAcademicYear = () => {
// //   const now = new Date();
// //   const year = now.getFullYear();
// //   const month = now.getMonth() + 1;
// //   return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
// // };

// // export const SEMESTERS = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10'];
// // export const LEVELS = ['L1','L2','L3','M1','M2','D1','D2','D3'];
// // export const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];



// const crypto = require('crypto');

// /**
//  * Génère un matricule unique selon le rôle
//  * Format :
//  *   super_admin → SA-YYYY-XXXX
//  *   admin       → ADM-YYYY-XXXX
//  *   teacher     → ENS-YYYY-XXXX
//  *   student     → ETU-YYYY-XXXX
//  *   staff       → STF-YYYY-XXXX
//  */
// const generateMatricule = (role) => {
//   const year = new Date().getFullYear();
//   const random = Math.floor(1000 + Math.random() * 9000); // 4 chiffres

//   const prefixMap = {
//     super_admin: 'SA',
//     admin: 'ADM',
//     teacher: 'ENS',
//     student: 'ETU',
//     staff: 'STF',
//     department_head: 'DIR'
//   };

//   const prefix = prefixMap[role] || 'USR';
//   return `${prefix}-${year}-${random}`;
// };

// /**
//  * Génère un mot de passe temporaire sécurisé
//  * Format : Xxx@0000 (lisible, complexe)
//  */
// const generateTempPassword = () => {
//   const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
//   const lower = 'abcdefghjkmnpqrstuvwxyz';
//   const digits = '23456789';
//   const specials = '@#!$';

//   const rand = (str) => str[Math.floor(Math.random() * str.length)];

//   // 2 majuscules + 3 minuscules + 2 chiffres + 1 spécial = 8 chars
//   const parts = [
//     rand(upper), rand(upper),
//     rand(lower), rand(lower), rand(lower),
//     rand(digits), rand(digits),
//     rand(specials)
//   ];

//   // Mélanger
//   for (let i = parts.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [parts[i], parts[j]] = [parts[j], parts[i]];
//   }

//   return parts.join('');
// };

// /**
//  * Génère un token aléatoire hex
//  */
// const generateToken = () => crypto.randomBytes(32).toString('hex');

// module.exports = { generateMatricule, generateTempPassword, generateToken };




// ─────────────────────────────────────────────
//  MENTIONS / NOTES
// ─────────────────────────────────────────────

export const getMention = (avg) => {
  if (avg >= 18) return { label: 'Excellent',  color: 'text-purple-600', bg: 'bg-purple-100' };
  if (avg >= 16) return { label: 'Très Bien',  color: 'text-blue-600',   bg: 'bg-blue-100'   };
  if (avg >= 14) return { label: 'Bien',        color: 'text-green-600',  bg: 'bg-green-100'  };
  if (avg >= 12) return { label: 'Assez Bien',  color: 'text-teal-600',   bg: 'bg-teal-100'   };
  if (avg >= 10) return { label: 'Passable',    color: 'text-yellow-600', bg: 'bg-yellow-100' };
  return           { label: 'Ajourné',          color: 'text-red-600',    bg: 'bg-red-100'    };
};

// ─────────────────────────────────────────────
//  RÔLES
// ─────────────────────────────────────────────

const ROLE_LABELS = {
  super_admin:     'Super Admin',
  admin:           'Administrateur',
  teacher:         'Enseignant',
  student:         'Étudiant',
  staff:           'Personnel',
  department_head: 'Chef Département',
};

const ROLE_COLORS = {
  super_admin:     'bg-purple-100 text-purple-700',
  admin:           'bg-blue-100 text-blue-700',
  teacher:         'bg-green-100 text-green-700',
  student:         'bg-yellow-100 text-yellow-700',
  staff:           'bg-gray-100 text-gray-700',
  department_head: 'bg-indigo-100 text-indigo-700',
};

export const getRoleLabel = (role) => ROLE_LABELS[role] || role;
export const getRoleColor = (role) => ROLE_COLORS[role] || 'bg-gray-100 text-gray-700';

// ─────────────────────────────────────────────
//  STATUTS
// ─────────────────────────────────────────────

const STATUS_COLORS = {
  active:    'bg-green-100 text-green-700',
  inactive:  'bg-gray-100 text-gray-700',
  suspended: 'bg-orange-100 text-orange-700',
  expelled:  'bg-red-100 text-red-700',
  graduated: 'bg-blue-100 text-blue-700',
  pending:   'bg-yellow-100 text-yellow-700',
  paid:      'bg-green-100 text-green-700',
  partial:   'bg-orange-100 text-orange-700',
  overdue:   'bg-red-100 text-red-700',
  planned:   'bg-blue-100 text-blue-700',
  ongoing:   'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const getStatusColor = (status) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';

// ─────────────────────────────────────────────
//  DATES & MONNAIE
// ─────────────────────────────────────────────

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatCurrency = (amount) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency', currency: 'DZD', minimumFractionDigits: 0,
  }).format(amount);
};

// ─────────────────────────────────────────────
//  DIVERS UI
// ─────────────────────────────────────────────

export const getInitials = (firstName, lastName) =>
  `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();

export const getCurrentAcademicYear = () => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

// ─────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────

export const SEMESTERS = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10'];
export const LEVELS    = ['L1','L2','L3','M1','M2','D1','D2','D3'];
export const DAYS      = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];