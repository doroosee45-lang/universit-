// Rôles utilisateurs
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  STAFF: 'staff',
  DEPARTMENT_HEAD: 'department_head'
};

// Statuts étudiant
const STUDENT_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  GRADUATED: 'graduated',
  EXPELLED: 'expelled',
  LEAVE: 'on_leave'
};

// Types de cours
const COURSE_TYPES = {
  CM: 'CM',
  TD: 'TD',
  TP: 'TP'
};

// Statuts de présence
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  JUSTIFIED: 'justified',
  LATE: 'late',
  EXEMPTED: 'exempted'
};

// Types d'évaluation
const ASSESSMENT_TYPES = {
  CC: 'controle_continu',
  PARTIEL: 'examen_partiel',
  FINAL: 'examen_final',
  PROJET: 'projet',
  STAGE: 'stage'
};

// Sessions d'examen
const EXAM_SESSIONS = {
  SESSION1: 'session1',
  SESSION2: 'session2'
};

// Mentions
const MENTIONS = {
  EXCELLENT: { label: 'Excellent', min: 18, max: 20 },
  TRES_BIEN: { label: 'Très Bien', min: 16, max: 17.99 },
  BIEN: { label: 'Bien', min: 14, max: 15.99 },
  ASSEZ_BIEN: { label: 'Assez Bien', min: 12, max: 13.99 },
  PASSABLE: { label: 'Passable', min: 10, max: 11.99 },
  AJOURNE: { label: 'Ajourné', min: 0, max: 9.99 }
};

// Statuts de paiement
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
  EXEMPTED: 'exempted'
};

// Types de notifications
const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  SUCCESS: 'success',
  ALERT: 'alert',
  MESSAGE: 'message'
};

// Niveaux
const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3', 'BTS1', 'BTS2', 'BUT1', 'BUT2', 'BUT3'];

// Semestres
const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];

// Note de validation
const PASSING_GRADE = 10;
const MAX_GRADE = 20;

// Tentatives de connexion max
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 heures

module.exports = {
  ROLES, STUDENT_STATUS, COURSE_TYPES, ATTENDANCE_STATUS,
  ASSESSMENT_TYPES, EXAM_SESSIONS, MENTIONS, PAYMENT_STATUS,
  NOTIFICATION_TYPES, LEVELS, SEMESTERS, PASSING_GRADE,
  MAX_GRADE, MAX_LOGIN_ATTEMPTS, LOCK_TIME
};