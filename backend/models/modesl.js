const mongoose = require('mongoose');
const User = require('./User.model');

// Admin
const AdminSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  department: String,
  permissions: [String] // permissions spécifiques supplémentaires
});

// Staff (Personnel administratif)
const StaffSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  position: {
    type: String,
    enum: ['scolarite', 'bibliotheque', 'finances', 'secretariat', 'informatique', 'autre'],
    default: 'secretariat'
  },
  department: String
});

const Admin = User.discriminator('admin', AdminSchema);
const Staff = User.discriminator('staff', StaffSchema);
const SuperAdmin = User.discriminator('super_admin', new mongoose.Schema({}));
const DepartmentHead = User.discriminator('department_head', new mongoose.Schema({
  department: String,
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' }
}));

module.exports = { Admin, Staff, SuperAdmin, DepartmentHead };

const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  ue: { type: mongoose.Schema.Types.ObjectId, ref: 'UE', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  academicYear: { type: String, required: true },
  groups: [String], // groupes concernés
  dueDate: { type: Date, required: true },
  maxScore: { type: Number, default: 20 },
  type: {
    type: String,
    enum: ['devoir_maison', 'tp', 'projet', 'expose', 'rapport', 'autre'],
    default: 'devoir_maison'
  },
  isGroupWork: { type: Boolean, default: false },
  attachments: [{ name: String, url: String }],
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  weight: { type: Number, default: 0 } // % dans la note de CC
}, { timestamps: true });

AssignmentSchema.index({ course: 1 });
AssignmentSchema.index({ teacher: 1 });
AssignmentSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);

const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../config/constants');

const AttendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: Object.values(ATTENDANCE_STATUS),
    default: ATTENDANCE_STATUS.ABSENT
  },
  checkInTime: Date,
  // Justificatif
  isJustified: { type: Boolean, default: false },
  justificationReason: String,
  justificationProofUrl: String,
  justificationApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  justificationApprovedAt: Date,
  // QR Code
  scannedViaQR: { type: Boolean, default: false },
  notes: String
}, { timestamps: true });

// Un étudiant ne peut avoir qu'une présence par cours par date
AttendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ course: 1, date: 1 });
AttendanceSchema.index({ student: 1, date: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sector: String,
  address: {
    street: String,
    city: String,
    wilaya: String,
    postalCode: String
  },
  phone: String,
  email: String,
  website: String,
  // Contact principal pour les stages
  contact: {
    name: String,
    position: String,
    phone: String,
    email: String
  },
  description: String,
  isActive: { type: Boolean, default: true },
  // Historique des stages
  totalInterns: { type: Number, default: 0 }
}, { timestamps: true });

CompanySchema.index({ name: 'text' });

module.exports = mongoose.model('Company', CompanySchema);

const mongoose = require('mongoose');
const { COURSE_TYPES, SEMESTERS } = require('../config/constants');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: Object.values(COURSE_TYPES), required: true },
  ue: { type: mongoose.Schema.Types.ObjectId, ref: 'UE', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  semester: { type: String, enum: SEMESTERS, required: true },
  academicYear: { type: String, required: true },
  // Groupes concernés (ex: G1, G2 pour TD/TP)
  groups: [String],
  // Volume horaire total
  totalHours: { type: Number, default: 0 },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

CourseSchema.index({ ue: 1 });
CourseSchema.index({ teacher: 1 });
CourseSchema.index({ program: 1, semester: 1 });

module.exports = mongoose.model('Course', CourseSchema);

const mongoose = require('mongoose');

const deliberationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  academicYear: { type: String, required: true },
  session: { type: String, enum: ['principale', 'rattrapage'], default: 'principale' },
  generalAverage: { type: Number, required: true },
  mention: { type: String, enum: ['Passable', 'Assez Bien', 'Bien', 'Très Bien', 'Non validé'] },
  validated: { type: Boolean, default: false },
  validatedAt: { type: Date },
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String },
  certificateGenerated: { type: Boolean, default: false },
  certificateNumber: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deliberation', deliberationSchema);

const mongoose = require('mongoose');

const DiplomaSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  diplomaNumber: { type: String, unique: true, required: true },
  graduationDate: { type: Date, required: true },
  academicYear: { type: String, required: true },
  generalAverage: { type: Number, required: true },
  mention: { type: String, required: true },
  totalECTS: Number,
  // Validation
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validatedAt: Date,
  // Documents
  pdfUrl: String,
  qrCodeUrl: String, // QR pour vérification
  // Supplément au diplôme
  diplomaSupplement: String,
  isIssued: { type: Boolean, default: false },
  issuedAt: Date,
  notes: String
}, { timestamps: true });

DiplomaSchema.index({ diplomaNumber: 1 });
DiplomaSchema.index({ student: 1 });

module.exports = mongoose.model('Diploma', DiplomaSchema);

const mongoose = require('mongoose');
const { SEMESTERS } = require('../config/constants');

const EnrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ue: { type: mongoose.Schema.Types.ObjectId, ref: 'UE', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, enum: SEMESTERS, required: true },
  group: { type: String }, // ex: G1, G2
  status: {
    type: String,
    enum: ['enrolled', 'validated', 'failed', 'withdrawn'],
    default: 'enrolled'
  },
  enrollmentDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Un étudiant ne peut s'inscrire qu'une fois par UE par année
EnrollmentSchema.index({ student: 1, ue: 1, academicYear: 1 }, { unique: true });
EnrollmentSchema.index({ student: 1, academicYear: 1 });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);

const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['conference', 'soutenance', 'reunion', 'ceremony', 'sport', 'cultural', 'autre'],
    default: 'autre'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: String,
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Audience
  isPublic: { type: Boolean, default: true },
  targetRoles: [String],
  targetPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
  // Participants
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxParticipants: Number,
  registrationRequired: { type: Boolean, default: false },
  registrationDeadline: Date,
  // Médias
  imageUrl: String,
  attachments: [{ name: String, url: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

EventSchema.index({ startDate: 1 });
EventSchema.index({ organizer: 1 });

module.exports = mongoose.model('Event', EventSchema);

const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../config/constants');

const FeeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academicYear: { type: String, required: true },
  // Détail des frais
  items: [{
    category: {
      type: String,
      enum: ['inscription', 'scolarite', 'bibliotheque', 'laboratoire', 'stage', 'soutenance', 'cvec', 'autre'],
      required: true
    },
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: Date,
    isPaid: { type: Boolean, default: false }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  remainingAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  // Bourse / Exonération
  scholarshipAmount: { type: Number, default: 0 },
  isExempted: { type: Boolean, default: false },
  exemptionReason: String,
  // Dates
  lastPaymentDate: Date,
  notes: String
}, { timestamps: true });

// Calcul automatique du restant dû
FeeSchema.pre('save', function (next) {
  this.remainingAmount = Math.max(0, this.totalAmount - this.paidAmount - this.scholarshipAmount);
  if (this.remainingAmount === 0) this.status = PAYMENT_STATUS.PAID;
  else if (this.paidAmount > 0) this.status = PAYMENT_STATUS.PARTIAL;
  next();
});

FeeSchema.index({ student: 1, academicYear: 1 }, { unique: true });
FeeSchema.index({ status: 1 });

module.exports = mongoose.model('Fee', FeeSchema);

const mongoose = require('mongoose');
const { ASSESSMENT_TYPES, EXAM_SESSIONS } = require('../config/constants');

const AssessmentSchema = new mongoose.Schema({
  type: { type: String, enum: Object.values(ASSESSMENT_TYPES), required: true },
  label: String, // ex: "CC1", "Examen Final S1"
  score: { type: Number, required: true, min: 0 },
  maxScore: { type: Number, default: 20 },
  weight: { type: Number, required: true }, // pourcentage ex: 40
  date: Date,
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enteredAt: { type: Date, default: Date.now }
});

const GradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ue: { type: mongoose.Schema.Types.ObjectId, ref: 'UE', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  session: { type: String, enum: Object.values(EXAM_SESSIONS), default: EXAM_SESSIONS.SESSION1 },
  assessments: [AssessmentSchema],
  
  // Calculé automatiquement
  average: { type: Number, default: 0, min: 0, max: 20 },
  mention: String,
  isValidated: { type: Boolean, default: false },
  ectsObtained: { type: Number, default: 0 },
  // Rattrapage session 2
  session2Score: { type: Number, min: 0, max: 20 },
  finalAverage: { type: Number, default: 0 },
  comment: String
}, { timestamps: true });

// Index pour recherche rapide
GradeSchema.index({ student: 1, ue: 1, academicYear: 1, session: 1 }, { unique: true });
GradeSchema.index({ student: 1, academicYear: 1 });
GradeSchema.index({ ue: 1, academicYear: 1 });

module.exports = mongoose.model('Grade', GradeSchema);



const mongoose = require('mongoose');
const User = require('./User.model');

// ✅ IMPORTANT : Attendre que le modèle User soit bien chargé
// Ne pas créer les discriminators avant que User soit défini

// Admin Schema
const AdminSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, sparse: true },
  department: { type: String, default: 'Administration' },
  permissions: { type: [String], default: [] }
});

// Staff Schema
const StaffSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, sparse: true },
  position: {
    type: String,
    enum: ['scolarite', 'bibliotheque', 'finances', 'secretariat', 'informatique', 'autre'],
    default: 'secretariat'
  },
  department: { type: String, default: 'Administratif' }
});

// SuperAdmin Schema (pas de champs supplémentaires)
const SuperAdminSchema = new mongoose.Schema({}, { strict: false });

// DepartmentHead Schema
const DepartmentHeadSchema = new mongoose.Schema({
  department: { type: String, required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' }
});

// ✅ CRÉATION DES DISCRIMINATORS (après que User est défini)
let Admin, Staff, SuperAdmin, DepartmentHead;

try {
  // Vérifier si le discriminator existe déjà pour éviter l'erreur
  Admin = User.discriminator('admin', AdminSchema);
  Staff = User.discriminator('staff', StaffSchema);
  SuperAdmin = User.discriminator('super_admin', SuperAdminSchema);
  DepartmentHead = User.discriminator('department_head', DepartmentHeadSchema);
  console.log('✅ Discriminators créés avec succès');
} catch (error) {
  console.error('❌ Erreur création discriminators:', error.message);
}

module.exports = { 
  User, 
  Admin, 
  Staff, 
  SuperAdmin, 
  DepartmentHead 
};



const mongoose = require('mongoose');
const { NOTIFICATION_TYPES, ROLES } = require('../config/constants');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = tous
  recipientRole: { type: String, enum: Object.values(ROLES) }, // rôle ciblé
  recipientProgram: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    default: NOTIFICATION_TYPES.INFO
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: String, // lien interne ex: /etudiant/grades
  isRead: { type: Boolean, default: false },
  readAt: Date,
  // Pour les notifications de masse
  isBroadcast: { type: Boolean, default: false },
  expiresAt: Date
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipientRole: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);


















// const mongoose = require('mongoose');

// const notificationSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   title: { type: String, required: true },
//   message: { type: String, required: true },
//   type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
//   read: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
//   metadata: { type: mongoose.Schema.Types.Mixed }
// });

// module.exports = mongoose.model('Notification', notificationSchema);



const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  fee: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  method: {
    type: String,
    enum: ['cash', 'carte_bancaire', 'virement', 'cheque', 'ccp', 'autre'],
    required: true
  },
  transactionId: { type: String, unique: true, sparse: true },
  reference: String,
  receiptNumber: { type: String, unique: true },
  receiptUrl: String, // PDF généré
  paymentDate: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String
}, { timestamps: true });

PaymentSchema.index({ fee: 1 });
PaymentSchema.index({ student: 1 });
PaymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);



const mongoose = require('mongoose');
const { LEVELS } = require('../config/constants');

const ProgramSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: {
    type: String,
    enum: ['Licence', 'Master', 'Doctorat', 'BUT', 'BTS', 'Ingénieur', 'Autre'],
    required: true
  },
  department: { type: String, required: true },
  description: String,
  levels: [{ type: String, enum: LEVELS }],
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  maxCapacity: { type: Number, default: 30 },
  academicYear: { type: String, required: true },
  duration: { type: Number, default: 6 }, // nombre de semestres
  isActive: { type: Boolean, default: true },
  objectives: String,
  // Spécialités / options
  specialties: [{ name: String, code: String }]
}, { timestamps: true });

ProgramSchema.index({ code: 1 });
ProgramSchema.index({ department: 1 });

module.exports = mongoose.model('Program', ProgramSchema);



const mongoose = require('mongoose');
const { LEVELS } = require('../config/constants');

const ProgramSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: {
    type: String,
    enum: ['Licence', 'Master', 'Doctorat', 'BUT', 'BTS', 'Ingénieur', 'Autre'],
    required: true
  },
  department: { type: String, required: true },
  description: String,
  levels: [{ type: String, enum: LEVELS }],
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  maxCapacity: { type: Number, default: 30 },
  academicYear: { type: String, required: true },
  duration: { type: Number, default: 6 }, // nombre de semestres
  isActive: { type: Boolean, default: true },
  objectives: String,
  // Spécialités / options
  specialties: [{ name: String, code: String }]
}, { timestamps: true });

ProgramSchema.index({ code: 1 });
ProgramSchema.index({ department: 1 });

module.exports = mongoose.model('Program', ProgramSchema);



const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true },
  building: String,
  floor: Number,
  type: {
    type: String,
    enum: ['amphi', 'salle_td', 'salle_tp', 'laboratoire', 'salle_informatique', 'salle_conference'],
    required: true
  },
  capacity: { type: Number, required: true, min: 1 },
  equipment: {
    hasProjector: { type: Boolean, default: false },
    hasAC: { type: Boolean, default: false },
    hasWhiteboard: { type: Boolean, default: true },
    hasComputers: { type: Boolean, default: false },
    numberOfComputers: { type: Number, default: 0 }
  },
  isAvailable: { type: Boolean, default: true },
  notes: String
}, { timestamps: true });

RoomSchema.index({ code: 1 });
RoomSchema.index({ type: 1, isAvailable: 1 });

module.exports = mongoose.model('Room', RoomSchema);


const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: String, required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  group: String, // G1, G2 pour TD/TP
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0=Dim, 1=Lun...6=Sam
  startTime: { type: String, required: true }, // ex: "08:00"
  endTime: { type: String, required: true },   // ex: "10:00"
  // Dates effectives (pour les cours ponctuels ou modifications)
  startDate: Date,
  endDate: Date,
  isRecurring: { type: Boolean, default: true },
  // Exceptions (cours annulé, déplacé)
  exceptions: [{
    date: Date,
    reason: String,
    newRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    newStartTime: String,
    newEndTime: String,
    isCancelled: { type: Boolean, default: false }
  }],
  notes: String
}, { timestamps: true });

ScheduleSchema.index({ program: 1, semester: 1, academicYear: 1 });
ScheduleSchema.index({ teacher: 1, academicYear: 1 });
ScheduleSchema.index({ room: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Schedule', ScheduleSchema);



















// const mongoose = require('mongoose');

// const scheduleSchema = new mongoose.Schema({
//   course: { type: String, required: true },
//   teacher: { type: String, required: true },
//   program: { type: String, default: '' },        // ex: "Informatique L2"
//   semester: { type: String, enum: ['S1','S2','S3','S4','S5','S6'], required: true },
//   group: { type: String, default: '' },
//   room: { type: String, default: '' },
//   day: { type: Number, min: 0, max: 6, required: true }, // 0=Lundi, 6=Dimanche (ou selon préférence)
//   start: { type: String, required: true },        // HH:MM
//   end: { type: String, required: true },
//   year: { type: String, required: true },         // Année académique ex: "2024-2025"
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Schedule', scheduleSchema);




const mongoose = require('mongoose');

const ScholarshipSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['bourse_etat', 'bourse_excellence', 'aide_sociale', 'exoneration', 'autre'],
    required: true
  },
  label: String,
  percentage: { type: Number, min: 0, max: 100 }, // % de réduction
  amount: { type: Number, min: 0 }, // montant fixe
  academicYear: { type: String, required: true },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  document: String, // URL justificatif
  notes: String
}, { timestamps: true });

ScholarshipSchema.index({ student: 1, academicYear: 1 });

module.exports = mongoose.model('Scholarship', ScholarshipSchema);


const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  academicYear: { type: String, required: true, unique: true },
  currentSemester: String,
  isActive: { type: Boolean, default: false },
  // Informations établissement
  schoolInfo: {
    name: String,
    arabicName: String,
    logo: String,
    address: String,
    phone: String,
    email: String,
    website: String,
    rector: String
  },
  // Calendrier académique
  semesterDates: [{
    semester: String,
    startDate: Date,
    endDate: Date,
    examStartDate: Date,
    examEndDate: Date
  }],
  // Barème de notation
  gradingScale: {
    passingGrade: { type: Number, default: 10 },
    maxGrade: { type: Number, default: 20 }
  },
  // Structure des frais par filière/niveau
  feeStructure: [{
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    level: String,
    inscriptionFee: { type: Number, default: 0 },
    scolarityFee: { type: Number, default: 0 },
    cvec: { type: Number, default: 0 },
    otherFees: [{ label: String, amount: Number }]
  }],
  // Jours fériés
  holidays: [{
    name: String,
    date: Date
  }],
  // Paramètres absences
  attendanceSettings: {
    maxAbsencePercentage: { type: Number, default: 25 },
    alertThreshold: { type: Number, default: 20 },
    lateToleranceMinutes: { type: Number, default: 15 }
  },
  // Bibliothèque
  librarySettings: {
    maxLoanDays: { type: Number, default: 14 },
    maxRenewals: { type: Number, default: 1 },
    finePerDay: { type: Number, default: 50 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
  },
  department: {
    type: String,
    trim: true,
    default: '',
  },
  position: {
    type: String,
    enum: ['scolarite', 'bibliotheque', 'finances', 'secretariat', 'informatique', 'autre'],
    default: 'secretariat',
  },
  role: {
    type: String,
    enum: ['staff', 'admin'],
    default: 'staff',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
  },
  profilePhoto: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Hash password avant sauvegarde
staffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Générer employeeId automatiquement
staffSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Staff').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Méthode pour comparer mot de passe
staffSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Staff', staffSchema);

const mongoose = require('mongoose');
const User = require('./User.model');
const { STUDENT_STATUS, LEVELS, SEMESTERS } = require('../config/constants');

const StudentSchema = new mongoose.Schema({
  // ✅ sparse: true permet plusieurs documents sans studentId (null/undefined)
  studentId: { type: String, unique: true, sparse: true },
  ine: { type: String, unique: true, sparse: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  level: { type: String, enum: LEVELS, required: true },
  currentSemester: { type: String, enum: SEMESTERS, required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, enum: Object.values(STUDENT_STATUS), default: STUDENT_STATUS.ACTIVE },
  academicYear: { type: String, required: true },
  documents: [{
    type: { type: String },
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  dateOfBirth: Date,
  placeOfBirth: String,
  nationality: { type: String, default: 'Algérienne' },
  guardian: {
    name: String,
    phone: String,
    email: String,
    relation: String
  },
  studentCardUrl: String,
  notes: String
});

// ✅ Auto-générer studentId avant sauvegarde s'il est absent
StudentSchema.pre('save', async function (next) {
  if (!this.studentId) {
    const year = new Date().getFullYear();
    // Compter les étudiants existants pour la séquence
    const count = await mongoose.model('student').countDocuments();
    this.studentId = `STU${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

StudentSchema.index({ studentId: 1 });
StudentSchema.index({ program: 1, level: 1 });
StudentSchema.index({ status: 1 });

const Student = User.discriminator('student', StudentSchema);
module.exports = Student;


const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, default: '' },
  files: [{ name: String, url: String, size: Number }],
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number, default: null },
  feedback: { type: String, default: '' },
  isLate: { type: Boolean, default: false },
}, { timestamps: true });

// Un étudiant = une soumission par devoir
SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);


const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submittedAt: { type: Date, default: Date.now },
  isLate: { type: Boolean, default: false },
  files: [{ name: String, url: String, size: Number }],
  comment: String,
  // Correction
  score: { type: Number, min: 0 },
  maxScore: { type: Number, default: 20 },
  feedback: String,
  correctedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  correctedAt: Date,
  status: {
    type: String,
    enum: ['submitted', 'late', 'graded', 'returned'],
    default: 'submitted'
  }
}, { timestamps: true });

SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);


const mongoose = require('mongoose');
const User = require('./User.model');

const TeacherSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  department: { type: String, required: true },
  title: {
    type: String,
    enum: ['Professeur', 'Maître de Conférences A', 'Maître de Conférences B',
      'Maître Assistant A', 'Maître Assistant B', 'Attaché d\'enseignement', 'Vacataire'],
    default: 'Maître Assistant A'
  },
  specialties: [String],
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  // UEs dont il est responsable
  responsibleUEs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UE' }],
  // Informations professionnelles
  hireDate: Date,
  contractType: {
    type: String,
    enum: ['permanent', 'contractuel', 'vacataire'],
    default: 'permanent'
  },
  office: String,
  bio: String,
  // Disponibilités
  availabilities: [{
    dayOfWeek: { type: Number, min: 0, max: 6 },
    startTime: String,
    endTime: String
  }]
});

TeacherSchema.index({ employeeId: 1 });
TeacherSchema.index({ department: 1 });

const Teacher = User.discriminator('teacher', TeacherSchema);
module.exports = Teacher;


const mongoose = require('mongoose');

const TranscriptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  semester: { type: String },
  // Détail des notes par UE
  ueGrades: [{
    ue: { type: mongoose.Schema.Types.ObjectId, ref: 'UE' },
    ueCode: String,
    ueTitle: String,
    coefficient: Number,
    credits: Number,
    average: Number,
    mention: String,
    isValidated: Boolean,
    ectsObtained: Number
  }],
  semesterAverage: Number,
  totalECTS: Number,
  mention: String,
  rank: Number,
  totalStudents: Number,
  generatedAt: { type: Date, default: Date.now },
  pdfUrl: String,
  qrCode: String,
  // Validation officielle
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isSigned: { type: Boolean, default: false }
}, { timestamps: true });

TranscriptSchema.index({ student: 1, academicYear: 1, semester: 1 });

module.exports = mongoose.model('Transcript', TranscriptSchema);


const mongoose = require('mongoose');
const { SEMESTERS } = require('../config/constants');

const UESchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  title: { type: String, required: true, trim: true },
  coefficient: { type: Number, required: true, min: 1, max: 10 },
  credits: { type: Number, required: true, min: 1, max: 12 }, // ECTS
  semester: { type: String, enum: SEMESTERS, required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  responsibleTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  // Volume horaire
  volumeHours: {
    cm: { type: Number, default: 1 }, // Cours Magistral
    td: { type: Number, default: 1 }, // Travaux Dirigés
    tp: { type: Number, default: 1 }  // Travaux Pratiques
  },
  isActive: { type: Boolean, default: true },
  // Répartition des évaluations
  evaluationWeights: {
    cc: { type: Number, default: 40 },     // Contrôle Continu %
    partiel: { type: Number, default: 20 }, // Examen Partiel %
    final: { type: Number, default: 40 }    // Examen Final %
  }
}, { timestamps: true });

UESchema.index({ code: 1 });
UESchema.index({ program: 1, semester: 1 });

module.exports = mongoose.model('UE', UESchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, MAX_LOGIN_ATTEMPTS, LOCK_TIME } = require('../config/constants');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: Object.values(ROLES), required: true },
  phone: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    wilaya: String,
    postalCode: String
  },
  profilePhoto: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  loginAttempts: { type: Number, default: 0, select: false },
  lockUntil: { type: Date, select: false },
  lastLogin: { type: Date },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false }
}, {
  timestamps: true,
  discriminatorKey: 'role'
});

// Index
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Virtual : nom complet
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual : compte verrouillé ?
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash du mot de passe avant sauvegarde
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Méthode : comparer mot de passe
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode : incrémenter tentatives de connexion
UserSchema.methods.incLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.updateOne(updates);
};

// Méthode : réinitialiser tentatives après connexion réussie
UserSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 }
  });
};

// Ne pas retourner le mot de passe dans JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  delete obj.twoFactorSecret;
  return obj;
};

const User = mongoose.model('User', UserSchema);

// ============================================
// ✅ DISCRIMINATORS - CRÉATION IMMÉDIATE
// ============================================

// Admin Schema
const AdminSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, sparse: true },
  department: { type: String, default: 'Administration' },
  permissions: { type: [String], default: [] }
}, { _id: false });

// Staff Schema
const StaffSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, sparse: true },
  position: {
    type: String,
    enum: ['scolarite', 'bibliotheque', 'finances', 'secretariat', 'informatique', 'autre'],
    default: 'secretariat'
  },
  department: { type: String, default: 'Administratif' }
}, { _id: false });

// ✅ SUPER ADMIN Schema - AVEC UN CHAMP (pas vide)
const SuperAdminSchema = new mongoose.Schema({
  superAdminLevel: { type: Number, default: 1 },
  systemAccess: { type: [String], default: ['all'] },
  masterKey: { type: String, select: false, default: null }
}, { _id: false });

// DepartmentHead Schema
const DepartmentHeadSchema = new mongoose.Schema({
  department: { type: String, required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' }
}, { _id: false });

// ✅ CRÉATION DES DISCRIMINATORS
try {
  const Admin = User.discriminator('admin', AdminSchema);
  const Staff = User.discriminator('staff', StaffSchema);
  const SuperAdmin = User.discriminator('super_admin', SuperAdminSchema);
  const DepartmentHead = User.discriminator('department_head', DepartmentHeadSchema);
  
  console.log('✅ Discriminators créés avec succès');
  console.log('   - admin');
  console.log('   - staff'); 
  console.log('   - super_admin');
  console.log('   - department_head');
  
  module.exports = User;
  module.exports.Admin = Admin;
  module.exports.Staff = Staff;
  module.exports.SuperAdmin = SuperAdmin;
  module.exports.DepartmentHead = DepartmentHead;
  
} catch (error) {
  console.error('❌ Erreur création discriminators:', error.message);
  module.exports = User;
}