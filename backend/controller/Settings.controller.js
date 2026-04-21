const Settings = require('../models/Settings.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Valeurs par défaut complètes (utilisées si aucun document n'existe en base)
const DEFAULT_SETTINGS = {
  academicYear: '2024-2025',
  currentSemester: 'S1',
  schoolInfo: {
    name: 'Université des Sciences et de la Technologie',
    arabicName: 'جامعة العلوم والتكنولوجيا',
    shortName: 'UST',
    address: '123 Boulevard de l\'Université, 16000 Alger',
    phone: '+213 (0) 23 45 67 89',
    email: 'contact@universite.dz',
    website: 'www.universite.dz',
    rector: 'Pr. Mohamed BENALI',
    viceRector: 'Pr. Fatima ZOHRA',
    secretaryGeneral: 'M. Ahmed KADRI',
    logo: '',
    establishedYear: '1985',
    fiscalNumber: '123456789',
    bankAccount: '12345 67890 1234567890 12',
  },
  semesterDates: [
    {
      semester: 'S1',
      startDate: '2024-09-15',
      endDate: '2024-12-20',
      examStartDate: '2024-12-22',
      examEndDate: '2024-12-31',
    },
    {
      semester: 'S2',
      startDate: '2025-01-05',
      endDate: '2025-03-28',
      examStartDate: '2025-03-30',
      examEndDate: '2025-04-08',
    },
  ],
  gradingScale: {
    passingGrade: 10,
    maxGrade: 20,
    minGrade: 0,
    decimalPlaces: 2,
    roundingMethod: 'half_up',
  },
  mentionScale: [
    { min: 18, max: 20,    label: 'Excellent',   color: '#9333EA', creditsBonus: 0 },
    { min: 16, max: 17.99, label: 'Très Bien',   color: '#2563EB', creditsBonus: 0 },
    { min: 14, max: 15.99, label: 'Bien',         color: '#059669', creditsBonus: 0 },
    { min: 12, max: 13.99, label: 'Assez Bien',   color: '#0D9488', creditsBonus: 0 },
    { min: 10, max: 11.99, label: 'Passable',     color: '#D97706', creditsBonus: 0 },
    { min: 0,  max: 9.99,  label: 'Non validé',  color: '#DC2626', creditsBonus: 0 },
  ],
  academicSettings: {
    ectsPerSemester: 30,
    ectsPerYear: 60,
    maxAbsencesPerCourse: 3,
    maxAbsencesPerSemester: 10,
    retakePolicy: 'automatic',
    maxRetakes: 2,
  },
  financialSettings: {
    tuitionFee: 50000,
    registrationFee: 15000,
    libraryFee: 2000,
    sportFee: 1000,
    insuranceFee: 3000,
    latePaymentPenalty: 5000,
    paymentDeadlineDays: 30,
    scholarshipDiscount: 50,
    siblingsDiscount: 10,
  },
  librarySettings: {
    maxLoanDays: 14,
    maxRenewals: 2,
    finePerDay: 50,
    maxBooksPerStudent: 5,
    maxBooksPerTeacher: 10,
    reservationDays: 3,
    digitalLoanDays: 7,
  },
  attendanceSettings: {
    maxAbsencePercentage: 25,
    alertThreshold: 20,
    lateToleranceMinutes: 15,
    generateQRCode: true,
    qrCodeExpiryMinutes: 15,
    autoMarkAbsent: true,
    requireJustification: true,
    justificationDeadlineDays: 5,
  },
  notificationSettings: {
    enableEmail: true,
    enableSMS: false,
    enablePush: true,
    adminEmail: 'admin@universite.dz',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    reminderDays: [7, 3, 1],
  },
  securitySettings: {
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordExpiryDays: 90,
    twoFactorAuth: false,
    allowSelfRegistration: false,
    requireEmailVerification: true,
    allowedDomains: ['universite.dz', 'edu.dz'],
  },
};

// GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Crée le document avec toutes les valeurs par défaut pour éviter
      // l'erreur de validation "academicYear is required"
      settings = await Settings.create(DEFAULT_SETTINGS);
    }
    return successResponse(res, settings);
  } catch (err) {
    console.error('getSettings error:', err.message);
    return errorResponse(res, err.message);
  }
};

// PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Merge les defaults avec le body pour garantir les champs requis
      settings = await Settings.create({ ...DEFAULT_SETTINGS, ...req.body });
    } else {
      // Met à jour champ par champ pour préserver les sous-documents existants
      Object.assign(settings, req.body);
      await settings.save();
    }
    return successResponse(res, settings, 'Paramètres mis à jour');
  } catch (err) {
    console.error('updateSettings error:', err.message);
    return errorResponse(res, err.message);
  }
};

// PUT /api/settings/academic-year
exports.updateAcademicYear = async (req, res) => {
  try {
    const { academicYear } = req.body;
    if (!academicYear) {
      return errorResponse(res, 'academicYear est requis', 400);
    }
    const settings = await Settings.findOneAndUpdate(
      {},
      { academicYear },          // ← champ correct (le modèle utilise academicYear)
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return successResponse(res, settings, 'Année académique mise à jour');
  } catch (err) {
    console.error('updateAcademicYear error:', err.message);
    return errorResponse(res, err.message);
  }
};