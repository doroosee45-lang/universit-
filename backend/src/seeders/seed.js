/**
 * ============================================================
 * SEED.JS — Base de données universitaire
 * Supprime toutes les collections existantes puis insère
 * des données réalistes pour tous les modèles.
 * Usage : node seed.js
 * ============================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Connexion ───────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_db';

// ─── Helpers ──────────────────────────────────────────────────
const hashPassword = async (pwd) => bcrypt.hash(pwd, 12);
const id = () => new mongoose.Types.ObjectId();
const today = new Date();
const daysAgo  = (n) => new Date(today - n * 86400000);
const daysNext = (n) => new Date(today.getTime() + n * 86400000);
const YEAR = '2024-2025';

// ─── Constantes EXAM_SESSIONS (inline pour éviter l'import) ──
const EXAM_SESSIONS = {
  SESSION1:   'session1',
  SESSION2:   'session2',
  RATTRAPAGE: 'rattrapage',
  MI_SESSION: 'mi_session',
  RECOURS:    'recours',
};

// ─── Schémas inline ───────────────────────────────────────────

// ──── User (base + discriminators) ───────────────────────────
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName:  String,
  email:     { type: String, unique: true, lowercase: true },
  password:  { type: String, select: false },
  role:      { type: String, enum: ['super_admin','admin','staff','department_head','teacher','student'] },
  phone:     String,
  address:   { street: String, city: String, wilaya: String, postalCode: String },
  profilePhoto: { type: String, default: null },
  isActive:  { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: true },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  twoFactorEnabled: { type: Boolean, default: false },
}, { timestamps: true, discriminatorKey: 'role' });

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

const User = mongoose.model('User', UserSchema);

// Discriminators
const Admin = User.discriminator('admin', new mongoose.Schema({
  employeeId: { type: String, unique: true, sparse: true },
  department: { type: String, default: 'Administration' },
  permissions: { type: [String], default: [] },
}, { _id: false }));

const StaffDiscriminator = User.discriminator('staff', new mongoose.Schema({
  employeeId: { type: String, unique: true, sparse: true },
  position:   { type: String, enum: ['scolarite','bibliotheque','finances','secretariat','informatique','autre'], default: 'secretariat' },
  department: { type: String, default: 'Administratif' },
}, { _id: false }));

const SuperAdmin = User.discriminator('super_admin', new mongoose.Schema({
  superAdminLevel: { type: Number, default: 1 },
  systemAccess:    { type: [String], default: ['all'] },
}, { _id: false }));

const DepartmentHead = User.discriminator('department_head', new mongoose.Schema({
  department: String,
  program:    { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
}, { _id: false }));

const Teacher = User.discriminator('teacher', new mongoose.Schema({
  employeeId:    { type: String, unique: true, sparse: true },
  department:    String,
  title:         { type: String, default: 'Maître Assistant A' },
  specialties:   [String],
  courses:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  responsibleUEs:[{ type: mongoose.Schema.Types.ObjectId, ref: 'UE' }],
  hireDate:      Date,
  contractType:  { type: String, default: 'permanent' },
  office:        String,
  bio:           String,
  availabilities:[{ dayOfWeek: Number, startTime: String, endTime: String }],
}, { _id: false }));

const Student = User.discriminator('student', new mongoose.Schema({
  studentId:      { type: String, unique: true, sparse: true },
  ine:            { type: String, unique: true, sparse: true },
  program:        { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  level:          String,
  currentSemester:String,
  enrollmentDate: { type: Date, default: Date.now },
  status:         { type: String, default: 'active' },
  academicYear:   String,
  documents:      [{ type: String, name: String, url: String, uploadedAt: Date }],
  dateOfBirth:    Date,
  placeOfBirth:   String,
  nationality:    { type: String, default: 'Algérienne' },
  guardian:       { name: String, phone: String, email: String, relation: String },
  notes:          String,
}, { _id: false }));

// ──── Staff standalone (collection séparée) ───────────────────
const staffSchema = new mongoose.Schema({
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:      { type: String, trim: true, default: '' },
  password:   { type: String, required: true, minlength: 6 },
  department: { type: String, trim: true, default: '' },
  position: {
    type: String,
    enum: ['scolarite','bibliotheque','finances','secretariat','informatique','autre'],
    default: 'secretariat',
  },
  role:        { type: String, enum: ['staff','admin'], default: 'staff' },
  isActive:    { type: Boolean, default: true },
  employeeId:  { type: String, unique: true, sparse: true },
  profilePhoto:{ type: String, default: '' },
}, { timestamps: true });

staffSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

staffSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Staff').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

const StaffModel = mongoose.model('Staff', staffSchema);

// ──── Autres modèles ──────────────────────────────────────────
const Program = mongoose.model('Program', new mongoose.Schema({
  name:        { type: String, required: true },
  code:        { type: String, required: true, unique: true, uppercase: true },
  type:        String,
  department:  String,
  description: String,
  levels:      [String],
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  maxCapacity: { type: Number, default: 30 },
  academicYear:String,
  duration:    { type: Number, default: 6 },
  isActive:    { type: Boolean, default: true },
  objectives:  String,
  specialties: [{ name: String, code: String }],
}, { timestamps: true }));

const UE = mongoose.model('UE', new mongoose.Schema({
  code:               { type: String, required: true, unique: true, uppercase: true },
  title:              String,
  coefficient:        Number,
  credits:            Number,
  semester:           String,
  program:            { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  responsibleTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description:        String,
  volumeHours:        { cm: Number, td: Number, tp: Number },
  isActive:           { type: Boolean, default: true },
  evaluationWeights:  { cc: { type: Number, default: 40 }, partiel: { type: Number, default: 20 }, final: { type: Number, default: 40 } },
}, { timestamps: true }));

const Course = mongoose.model('Course', new mongoose.Schema({
  title:       String,
  code:        { type: String, required: true, unique: true, uppercase: true },
  type:        { type: String, enum: ['CM','TD','TP'] },
  ue:          { type: mongoose.Schema.Types.ObjectId, ref: 'UE' },
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  program:     { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  semester:    String,
  academicYear:String,
  groups:      [String],
  totalHours:  Number,
  description: String,
  isActive:    { type: Boolean, default: true },
}, { timestamps: true }));

const Room = mongoose.model('Room', new mongoose.Schema({
  name:      String,
  code:      { type: String, required: true, unique: true },
  building:  String,
  floor:     Number,
  type:      { type: String, enum: ['amphi','salle_td','salle_tp','laboratoire','salle_informatique','salle_conference'] },
  capacity:  Number,
  equipment: { hasProjector: Boolean, hasAC: Boolean, hasWhiteboard: Boolean, hasComputers: Boolean, numberOfComputers: Number },
  isAvailable:{ type: Boolean, default: true },
  notes:     String,
}, { timestamps: true }));

// ✅ NOUVEAU — Modèle Exam inline
const ExamSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  ue:           { type: mongoose.Schema.Types.ObjectId, ref: 'UE', required: true },
  course:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  program:      { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  session:      { type: String, enum: Object.values(EXAM_SESSIONS), required: true },
  type: {
    type: String,
    enum: ['partiel', 'final', 'rattrapage', 'tp', 'oral', 'projet'],
    required: true,
  },
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, required: true },
  duration:     Number,
  room:         { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  supervisors:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  groups:       [String],
  maxScore:     { type: Number, default: 20 },
  coefficient:  Number,
  instructions: String,
  isPublished:  { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['planned', 'ongoing', 'completed', 'cancelled'],
    default: 'planned',
  },
  deliberationDate:  Date,
  deliberationNotes: String,
}, { timestamps: true });

ExamSchema.index({ ue: 1, academicYear: 1, session: 1 });
ExamSchema.index({ program: 1, startDate: 1 });

const Exam = mongoose.model('Exam', ExamSchema);

const Schedule = mongoose.model('Schedule', new mongoose.Schema({
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  room:        String,
  program:     { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  academicYear:String,
  semester:    String,
  group:       String,
  dayOfWeek:   Number,
  startTime:   String,
  endTime:     String,
  startDate:   Date,
  endDate:     Date,
  isRecurring: { type: Boolean, default: true },
  exceptions:  [{ date: Date, reason: String, isCancelled: Boolean }],
  notes:       String,
}, { timestamps: true }));

const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ue:          { type: mongoose.Schema.Types.ObjectId, ref: 'UE' },
  program:     { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  academicYear:String,
  semester:    String,
  group:       String,
  status:      { type: String, default: 'enrolled' },
  enrollmentDate: { type: Date, default: Date.now },
}, { timestamps: true }));

const AssessmentSchema = new mongoose.Schema({
  type:    String, label: String, score: Number,
  maxScore:{ type: Number, default: 20 }, weight: Number, date: Date,
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enteredAt: { type: Date, default: Date.now },
});

const Grade = mongoose.model('Grade', new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ue:          { type: mongoose.Schema.Types.ObjectId, ref: 'UE' },
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  program:     { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  academicYear:String, semester: String,
  session:     { type: String, default: 'session1' },
  assessments: [AssessmentSchema],
  average: Number, mention: String,
  isValidated: { type: Boolean, default: false },
  ectsObtained:Number, session2Score: Number, finalAverage: Number, comment: String,
}, { timestamps: true }));

const Attendance = mongoose.model('Attendance', new mongoose.Schema({
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  teacher:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date, status: { type: String, enum: ['present','absent','late','excused'], default: 'absent' },
  checkInTime: Date, isJustified: { type: Boolean, default: false },
  justificationReason: String, scannedViaQR: { type: Boolean, default: false }, notes: String,
}, { timestamps: true }));

const Assignment = mongoose.model('Assignment', new mongoose.Schema({
  title: String, description: String,
  course:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  ue:      { type: mongoose.Schema.Types.ObjectId, ref: 'UE' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  academicYear: String, groups: [String], dueDate: Date,
  maxScore: { type: Number, default: 20 }, type: { type: String, default: 'devoir_maison' },
  isGroupWork: { type: Boolean, default: false },
  attachments: [{ name: String, url: String }],
  isPublished: { type: Boolean, default: false }, publishedAt: Date,
  weight: { type: Number, default: 0 },
}, { timestamps: true }));

const Submission = mongoose.model('Submission', new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date, default: Date.now }, isLate: { type: Boolean, default: false },
  files: [{ name: String, url: String, size: Number }],
  comment: String, score: Number, maxScore: { type: Number, default: 20 },
  feedback: String, correctedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  correctedAt: Date, status: { type: String, default: 'submitted' },
}, { timestamps: true }));

const Fee = mongoose.model('Fee', new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  academicYear:String,
  items: [{ category: String, label: String, amount: Number, dueDate: Date, isPaid: { type: Boolean, default: false } }],
  totalAmount: Number, paidAmount: { type: Number, default: 0 }, remainingAmount: Number,
  status: { type: String, default: 'pending' }, scholarshipAmount: { type: Number, default: 0 },
  isExempted: { type: Boolean, default: false }, lastPaymentDate: Date, notes: String,
}, { timestamps: true }));

const Payment = mongoose.model('Payment', new mongoose.Schema({
  fee:     { type: mongoose.Schema.Types.ObjectId, ref: 'Fee' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number, method: { type: String, enum: ['cash','carte_bancaire','virement','cheque','ccp','autre'], default: 'cash' },
  transactionId: { type: String, unique: true, sparse: true },
  reference: String, receiptNumber: { type: String, unique: true, sparse: true },
  receiptUrl: String, paymentDate: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, notes: String,
}, { timestamps: true }));

const Scholarship = mongoose.model('Scholarship', new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, label: String, percentage: Number, amount: Number,
  academicYear: String, startDate: Date, endDate: Date,
  isActive: { type: Boolean, default: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  document: String, notes: String,
}, { timestamps: true }));

const Company = mongoose.model('Company', new mongoose.Schema({
  name: { type: String, required: true }, sector: String,
  address: { street: String, city: String, wilaya: String, postalCode: String },
  phone: String, email: String, website: String,
  contact: { name: String, position: String, phone: String, email: String },
  description: String, isActive: { type: Boolean, default: true },
  totalInterns: { type: Number, default: 0 },
}, { timestamps: true }));

const Notification = mongoose.model('Notification', new mongoose.Schema({
  recipient:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientRole:   String,
  recipientProgram:{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  sender:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, default: 'info' }, title: String, message: String,
  link: String, isRead: { type: Boolean, default: false }, readAt: Date,
  isBroadcast: { type: Boolean, default: false }, expiresAt: Date,
}, { timestamps: true }));

const Event = mongoose.model('Event', new mongoose.Schema({
  title: String, description: String, type: { type: String, default: 'autre' },
  startDate: Date, endDate: Date, location: String,
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: true }, targetRoles: [String],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxParticipants: Number, registrationRequired: { type: Boolean, default: false },
  imageUrl: String, isActive: { type: Boolean, default: true },
}, { timestamps: true }));

const Settings = mongoose.model('Settings', new mongoose.Schema({
  academicYear: { type: String, unique: true }, currentSemester: String,
  isActive: { type: Boolean, default: true },
  schoolInfo: { name: String, arabicName: String, logo: String, address: String, phone: String, email: String, website: String, rector: String },
  semesterDates: [{ semester: String, startDate: Date, endDate: Date, examStartDate: Date, examEndDate: Date }],
  gradingScale: { passingGrade: { type: Number, default: 10 }, maxGrade: { type: Number, default: 20 } },
  feeStructure: [{ program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' }, level: String, inscriptionFee: Number, scolarityFee: Number, cvec: Number }],
  holidays: [{ name: String, date: Date }],
  attendanceSettings: { maxAbsencePercentage: Number, alertThreshold: Number, lateToleranceMinutes: Number },
  librarySettings: { maxLoanDays: Number, maxRenewals: Number, finePerDay: Number },
}, { timestamps: true }));

const Transcript = mongoose.model('Transcript', new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  academicYear: String, semester: String,
  ueGrades: [{ ue: { type: mongoose.Schema.Types.ObjectId, ref: 'UE' }, ueCode: String, ueTitle: String, coefficient: Number, credits: Number, average: Number, mention: String, isValidated: Boolean, ectsObtained: Number }],
  semesterAverage: Number, totalECTS: Number, mention: String,
  rank: Number, totalStudents: Number,
  generatedAt: { type: Date, default: Date.now }, pdfUrl: String, qrCode: String,
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isSigned: { type: Boolean, default: false },
}, { timestamps: true }));

const Deliberation = mongoose.model('Deliberation', new mongoose.Schema({
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  program:  { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  academicYear: String, session: { type: String, default: 'principale' },
  generalAverage: Number, mention: String,
  validated: { type: Boolean, default: false }, validatedAt: Date,
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: String, certificateGenerated: { type: Boolean, default: false },
  certificateNumber: { type: String, unique: true, sparse: true },
}, { timestamps: true }));

const Diploma = mongoose.model('Diploma', new mongoose.Schema({
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  program:  { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  diplomaNumber: { type: String, unique: true },
  graduationDate: Date, academicYear: String,
  generalAverage: Number, mention: String, totalECTS: Number,
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validatedAt: Date, pdfUrl: String, qrCodeUrl: String,
  isIssued: { type: Boolean, default: false }, issuedAt: Date, notes: String,
}, { timestamps: true }));

// ─── Collections à vider ──────────────────────────────────────
const COLLECTIONS = [
  'users', 'staffs',
  'programs', 'ues', 'courses', 'rooms', 'schedules',
  'enrollments', 'grades', 'attendances', 'assignments', 'submissions',
  'fees', 'payments', 'scholarships', 'companies', 'notifications',
  'events', 'settings', 'transcripts', 'deliberations', 'diplomas',
  'exams', // ✅ AJOUTÉ
];

// ─── Mention helper ───────────────────────────────────────────
const getMention = (avg) => {
  if (avg >= 16) return 'Très Bien';
  if (avg >= 14) return 'Bien';
  if (avg >= 12) return 'Assez Bien';
  if (avg >= 10) return 'Passable';
  return 'Non validé';
};

// ═════════════════════════════════════════════════════════════
// SEED PRINCIPAL
// ═════════════════════════════════════════════════════════════
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connecté à MongoDB :', MONGO_URI);

  // ── 1. SUPPRESSION ──────────────────────────────────────────
  console.log('\n🗑️  Suppression des anciennes données...');
  for (const col of COLLECTIONS) {
    try {
      await mongoose.connection.collection(col).drop();
      console.log(`   ✓ ${col} supprimée`);
    } catch {
      console.log(`   ~ ${col} inexistante (ignorée)`);
    }
  }

  // ── 2. SETTINGS ─────────────────────────────────────────────
  console.log('\n⚙️  Paramètres de l\'établissement...');
  await Settings.create({
    academicYear: YEAR, currentSemester: 'S1', isActive: true,
    schoolInfo: {
      name: 'Université des Sciences et Technologies',
      arabicName: 'جامعة العلوم والتكنولوجيا',
      address: 'Cité Universitaire, Alger, 16000',
      phone: '+213 21 00 00 00', email: 'contact@univ-ust.dz',
      website: 'https://www.univ-ust.dz', rector: 'Pr. Mohammed Benali',
    },
    semesterDates: [
      { semester: 'S1', startDate: new Date('2024-09-15'), endDate: new Date('2025-01-31'), examStartDate: new Date('2025-01-18'), examEndDate: new Date('2025-01-31') },
      { semester: 'S2', startDate: new Date('2025-02-15'), endDate: new Date('2025-06-30'), examStartDate: new Date('2025-06-14'), examEndDate: new Date('2025-06-30') },
    ],
    gradingScale: { passingGrade: 10, maxGrade: 20 },
    attendanceSettings: { maxAbsencePercentage: 25, alertThreshold: 20, lateToleranceMinutes: 15 },
    librarySettings: { maxLoanDays: 14, maxRenewals: 1, finePerDay: 50 },
    holidays: [
      { name: 'Aïd el-Fitr',             date: new Date('2025-03-30') },
      { name: 'Fête du Travail',          date: new Date('2025-05-01') },
      { name: 'Fête de l\'Indépendance', date: new Date('2025-07-05') },
    ],
  });
  console.log('   ✓ Settings créés');

  // ── 3. PROGRAMMES ────────────────────────────────────────────
  console.log('\n📚 Programmes...');
  const programs = await Program.insertMany([
    { name: 'Licence Informatique',             code: 'L-INFO', type: 'Licence', department: 'Informatique',   levels: ['L1','L2','L3'], maxCapacity: 40, academicYear: YEAR, duration: 6, isActive: true, objectives: 'Maîtriser les fondamentaux de l\'informatique' },
    { name: 'Master Génie Logiciel',            code: 'M-GL',   type: 'Master',  department: 'Informatique',   levels: ['M1','M2'],       maxCapacity: 25, academicYear: YEAR, duration: 4, isActive: true, objectives: 'Former des ingénieurs en génie logiciel' },
    { name: 'Licence Mathématiques',            code: 'L-MATH', type: 'Licence', department: 'Mathématiques',  levels: ['L1','L2','L3'], maxCapacity: 35, academicYear: YEAR, duration: 6, isActive: true, objectives: 'Développer la rigueur mathématique' },
    { name: 'Master Intelligence Artificielle', code: 'M-IA',   type: 'Master',  department: 'Informatique',   levels: ['M1','M2'],       maxCapacity: 20, academicYear: YEAR, duration: 4, isActive: true, objectives: 'Former des experts en IA' },
  ]);
  console.log(`   ✓ ${programs.length} programmes créés`);

  // ── 4. SALLES ────────────────────────────────────────────────
  console.log('\n🏛️  Salles...');
  const rooms = await Room.insertMany([
    { name: 'Amphithéâtre A',         code: 'AMPHI-A',    building: 'Bloc A', floor: 0, type: 'amphi',             capacity: 200, equipment: { hasProjector: true,  hasAC: true,  hasWhiteboard: true,  hasComputers: false }, isAvailable: true },
    { name: 'Amphithéâtre B',         code: 'AMPHI-B',    building: 'Bloc A', floor: 0, type: 'amphi',             capacity: 150, equipment: { hasProjector: true,  hasAC: false, hasWhiteboard: true,  hasComputers: false }, isAvailable: true },
    { name: 'Salle TD 101',           code: 'TD-101',     building: 'Bloc B', floor: 1, type: 'salle_td',          capacity: 35,  equipment: { hasProjector: true,  hasAC: false, hasWhiteboard: true,  hasComputers: false }, isAvailable: true },
    { name: 'Salle TD 102',           code: 'TD-102',     building: 'Bloc B', floor: 1, type: 'salle_td',          capacity: 35,  equipment: { hasProjector: false, hasAC: false, hasWhiteboard: true,  hasComputers: false }, isAvailable: true },
    { name: 'Salle TP Informatique 1',code: 'TP-INFO-1',  building: 'Bloc C', floor: 2, type: 'salle_informatique',capacity: 30,  equipment: { hasProjector: true,  hasAC: true,  hasWhiteboard: true,  hasComputers: true, numberOfComputers: 30 }, isAvailable: true },
    { name: 'Salle TP Informatique 2',code: 'TP-INFO-2',  building: 'Bloc C', floor: 2, type: 'salle_informatique',capacity: 25,  equipment: { hasProjector: true,  hasAC: true,  hasWhiteboard: true,  hasComputers: true, numberOfComputers: 25 }, isAvailable: true },
    { name: 'Salle Conférence',       code: 'CONF-1',     building: 'Bloc D', floor: 0, type: 'salle_conference',  capacity: 80,  equipment: { hasProjector: true,  hasAC: true,  hasWhiteboard: true,  hasComputers: false }, isAvailable: true },
  ]);
  console.log(`   ✓ ${rooms.length} salles créées`);

  // ── 5. UTILISATEURS ─────────────────────────────────────────
  console.log('\n👥 Utilisateurs...');
  const pwd = await hashPassword('password123');

  const superAdmin = await User.create({
    firstName: 'Karim', lastName: 'Boudiaf',
    email: 'superadmin@univ-ust.dz', password: pwd, role: 'super_admin',
    phone: '0550000001', isActive: true, isEmailVerified: true, lastLogin: daysAgo(1),
    superAdminLevel: 1, systemAccess: ['all'],
  });

  const admin = await User.create({
    firstName: 'Fatima', lastName: 'Benali',
    email: 'admin@univ-ust.dz', password: pwd, role: 'admin',
    phone: '0550000002', isActive: true, isEmailVerified: true, lastLogin: daysAgo(2),
    employeeId: 'ADM-001', department: 'Direction',
    permissions: ['manage_students','manage_courses','manage_fees'],
  });

  const staffUsersRaw = [
    { firstName: 'Rachid', lastName: 'Hamdi',   email: 'scolarite@univ-ust.dz',    phone: '0550000003', employeeId: 'STF-001', position: 'scolarite',    department: 'Scolarité' },
    { firstName: 'Nadia',  lastName: 'Khelifi', email: 'bibliotheque@univ-ust.dz', phone: '0550000004', employeeId: 'STF-002', position: 'bibliotheque', department: 'Bibliothèque' },
    { firstName: 'Omar',   lastName: 'Meziane', email: 'finances@univ-ust.dz',     phone: '0550000005', employeeId: 'STF-003', position: 'finances',     department: 'Finances' },
  ];
  const staffUsersDocs = await User.insertMany(
    staffUsersRaw.map(s => ({ ...s, password: pwd, role: 'staff', isActive: true, isEmailVerified: true }))
  );

  const deptHeads = await User.insertMany([
    { firstName: 'Pr. Ahmed', lastName: 'Saidi',     email: 'chef.info@univ-ust.dz', password: pwd, role: 'department_head', phone: '0550000010', isActive: true, isEmailVerified: true, department: 'Informatique',  program: programs[0]._id },
    { firstName: 'Pr. Leila', lastName: 'Benmoussa', email: 'chef.math@univ-ust.dz', password: pwd, role: 'department_head', phone: '0550000011', isActive: true, isEmailVerified: true, department: 'Mathématiques', program: programs[2]._id },
  ]);

  const teachers = await User.insertMany([
    { firstName: 'Dr. Yacine', lastName: 'Amrani',    email: 'y.amrani@univ-ust.dz',    password: pwd, role: 'teacher', phone: '0550000020', isActive: true, isEmailVerified: true, employeeId: 'ENS-001', department: 'Informatique',  title: 'Maître de Conférences A', specialties: ['Algorithmes','Structures de données'], hireDate: new Date('2015-09-01'), contractType: 'permanent',   office: 'Bureau C201', availabilities: [{ dayOfWeek: 1, startTime: '08:00', endTime: '12:00' }] },
    { firstName: 'Dr. Samia',  lastName: 'Ouali',     email: 's.ouali@univ-ust.dz',     password: pwd, role: 'teacher', phone: '0550000021', isActive: true, isEmailVerified: true, employeeId: 'ENS-002', department: 'Informatique',  title: 'Maître Assistant A',      specialties: ['Bases de données','SQL'],              hireDate: new Date('2018-09-01'), contractType: 'permanent',   office: 'Bureau C202' },
    { firstName: 'Dr. Hocine', lastName: 'Belkacemi', email: 'h.belkacemi@univ-ust.dz', password: pwd, role: 'teacher', phone: '0550000022', isActive: true, isEmailVerified: true, employeeId: 'ENS-003', department: 'Informatique',  title: 'Maître de Conférences B', specialties: ['Réseaux','Sécurité'],                 hireDate: new Date('2012-09-01'), contractType: 'permanent',   office: 'Bureau C203' },
    { firstName: 'Dr. Meriem', lastName: 'Hadj',      email: 'm.hadj@univ-ust.dz',      password: pwd, role: 'teacher', phone: '0550000023', isActive: true, isEmailVerified: true, employeeId: 'ENS-004', department: 'Mathématiques', title: 'Professeur',              specialties: ['Analyse','Algèbre linéaire'],         hireDate: new Date('2008-09-01'), contractType: 'permanent',   office: 'Bureau B101' },
    { firstName: 'M. Sofiane', lastName: 'Rezki',     email: 's.rezki@univ-ust.dz',     password: pwd, role: 'teacher', phone: '0550000024', isActive: true, isEmailVerified: true, employeeId: 'ENS-005', department: 'Informatique',  title: 'Maître Assistant B',      specialties: ['Développement web','JavaScript'],    hireDate: new Date('2021-09-01'), contractType: 'contractuel', office: 'Bureau C204' },
  ]);

  const studentsL2Info = await User.insertMany([
    { firstName: 'Ayoub',  lastName: 'Mansouri',  email: 'a.mansouri@etu.univ-ust.dz',  password: pwd, role: 'student', phone: '0660000001', isActive: true, isEmailVerified: true, dateOfBirth: new Date('2003-05-12'), placeOfBirth: 'Alger',      program: programs[0]._id, level: 'L2', currentSemester: 'S3', enrollmentDate: daysAgo(400), status: 'active', academicYear: YEAR, studentId: 'STU20240001', ine: 'INE240001', guardian: { name: 'Mansouri Hocine', phone: '0770000001', relation: 'Père' } },
    { firstName: 'Sara',   lastName: 'Benhamida', email: 's.benhamida@etu.univ-ust.dz', password: pwd, role: 'student', phone: '0660000002', isActive: true, isEmailVerified: true, dateOfBirth: new Date('2003-08-22'), placeOfBirth: 'Oran',       program: programs[0]._id, level: 'L2', currentSemester: 'S3', enrollmentDate: daysAgo(400), status: 'active', academicYear: YEAR, studentId: 'STU20240002', ine: 'INE240002', guardian: { name: 'Benhamida Fatima', phone: '0770000002', relation: 'Mère' } },
    { firstName: 'Khalil', lastName: 'Djafer',    email: 'k.djafer@etu.univ-ust.dz',    password: pwd, role: 'student', phone: '0660000003', isActive: true, isEmailVerified: true, dateOfBirth: new Date('2002-11-30'), placeOfBirth: 'Constantine', program: programs[0]._id, level: 'L2', currentSemester: 'S3', enrollmentDate: daysAgo(400), status: 'active', academicYear: YEAR, studentId: 'STU20240003', ine: 'INE240003', guardian: { name: 'Djafer Kamel',    phone: '0770000003', relation: 'Père' } },
    { firstName: 'Lina',   lastName: 'Cherif',    email: 'l.cherif@etu.univ-ust.dz',    password: pwd, role: 'student', phone: '0660000004', isActive: true, isEmailVerified: true, dateOfBirth: new Date('2003-02-14'), placeOfBirth: 'Blida',      program: programs[0]._id, level: 'L2', currentSemester: 'S3', enrollmentDate: daysAgo(400), status: 'active', academicYear: YEAR, studentId: 'STU20240004', ine: 'INE240004', guardian: { name: 'Cherif Ali',      phone: '0770000004', relation: 'Père' } },
    { firstName: 'Amine',  lastName: 'Boukhali',  email: 'a.boukhali@etu.univ-ust.dz',  password: pwd, role: 'student', phone: '0660000005', isActive: true, isEmailVerified: true, dateOfBirth: new Date('2002-07-08'), placeOfBirth: 'Sétif',      program: programs[0]._id, level: 'L2', currentSemester: 'S3', enrollmentDate: daysAgo(400), status: 'active', academicYear: YEAR, studentId: 'STU20240005', ine: 'INE240005', guardian: { name: 'Boukhali Mourad', phone: '0770000005', relation: 'Père' } },
  ]);

  const studentsM1GL = await User.insertMany([
    { firstName: 'Rania',   lastName: 'Boussaid', email: 'r.boussaid@etu.univ-ust.dz', password: pwd, role: 'student', phone: '0660000010', isActive: true, isEmailVerified: true, dateOfBirth: new Date('2001-03-19'), placeOfBirth: 'Annaba',     program: programs[1]._id, level: 'M1', currentSemester: 'S1', enrollmentDate: daysAgo(60), status: 'active', academicYear: YEAR, studentId: 'STU20240010', ine: 'INE240010' },
    { firstName: 'Ismail',  lastName: 'Tebbal',   email: 'i.tebbal@etu.univ-ust.dz',   password: pwd, role: 'student', phone: '0660000011', isActive: true, isEmailVerified: true, dateOfBirth: new Date('2001-09-05'), placeOfBirth: 'Tizi Ouzou', program: programs[1]._id, level: 'M1', currentSemester: 'S1', enrollmentDate: daysAgo(60), status: 'active', academicYear: YEAR, studentId: 'STU20240011', ine: 'INE240011' },
    { firstName: 'Yasmine', lastName: 'Aouadi',   email: 'y.aouadi@etu.univ-ust.dz',   password: pwd, role: 'student', phone: '0660000012', isActive: true, isEmailVerified: true, dateOfBirth: new Date('2001-12-01'), placeOfBirth: 'Béjaïa',    program: programs[1]._id, level: 'M1', currentSemester: 'S1', enrollmentDate: daysAgo(60), status: 'active', academicYear: YEAR, studentId: 'STU20240012', ine: 'INE240012' },
  ]);

  const allStudents = [...studentsL2Info, ...studentsM1GL];
  console.log(`   ✓ 1 superadmin · 1 admin · ${staffUsersDocs.length} staff · ${deptHeads.length} chefs dept · ${teachers.length} enseignants · ${allStudents.length} étudiants`);

  // ── 6. STAFF STANDALONE ──────────────────────────────────────
  console.log('\n🧑‍💼 Personnel administratif (collection Staff)...');
  const staffPassword = 'Staff@123';
  const staffEntries = [
    { firstName: 'Rachid',    lastName: 'Hamdi',      email: 'rachid.hamdi@univ-ust.dz',    phone: '0550100001', department: 'Scolarité',     position: 'scolarite',    employeeId: 'EMP00001', isActive: true },
    { firstName: 'Siham',     lastName: 'Azizi',       email: 'siham.azizi@univ-ust.dz',     phone: '0550100002', department: 'Scolarité',     position: 'scolarite',    employeeId: 'EMP00002', isActive: true },
    { firstName: 'Kaoutar',   lastName: 'Brahimi',     email: 'k.brahimi@univ-ust.dz',       phone: '0550100003', department: 'Scolarité',     position: 'scolarite',    employeeId: 'EMP00003', isActive: true },
    { firstName: 'Nadia',     lastName: 'Khelifi',     email: 'nadia.khelifi@univ-ust.dz',   phone: '0550100004', department: 'Bibliothèque',  position: 'bibliotheque', employeeId: 'EMP00004', isActive: true },
    { firstName: 'Tarek',     lastName: 'Sellami',     email: 't.sellami@univ-ust.dz',       phone: '0550100005', department: 'Bibliothèque',  position: 'bibliotheque', employeeId: 'EMP00005', isActive: true },
    { firstName: 'Omar',      lastName: 'Meziane',     email: 'omar.meziane@univ-ust.dz',    phone: '0550100006', department: 'Finances',      position: 'finances',     employeeId: 'EMP00006', isActive: true },
    { firstName: 'Houria',    lastName: 'Bensalem',    email: 'h.bensalem@univ-ust.dz',      phone: '0550100007', department: 'Finances',      position: 'finances',     employeeId: 'EMP00007', isActive: true },
    { firstName: 'Lynda',     lastName: 'Rahmani',     email: 'l.rahmani@univ-ust.dz',       phone: '0550100008', department: 'Secrétariat',   position: 'secretariat',  employeeId: 'EMP00008', isActive: true },
    { firstName: 'Farida',    lastName: 'Oukil',       email: 'f.oukil@univ-ust.dz',         phone: '0550100009', department: 'Secrétariat',   position: 'secretariat',  employeeId: 'EMP00009', isActive: true },
    { firstName: 'Abdelkrim', lastName: 'Benissa',     email: 'a.benissa@univ-ust.dz',       phone: '0550100010', department: 'Secrétariat',   position: 'secretariat',  employeeId: 'EMP00010', isActive: true },
    { firstName: 'Yazid',     lastName: 'Mokhtari',    email: 'y.mokhtari@univ-ust.dz',      phone: '0550100011', department: 'Informatique',  position: 'informatique', employeeId: 'EMP00011', isActive: true },
    { firstName: 'Sabrina',   lastName: 'Chekroud',    email: 's.chekroud@univ-ust.dz',      phone: '0550100012', department: 'Informatique',  position: 'informatique', employeeId: 'EMP00012', isActive: true },
    { firstName: 'Mourad',    lastName: 'Bettache',    email: 'm.bettache@univ-ust.dz',      phone: '0550100013', department: 'Maintenance',   position: 'autre',        employeeId: 'EMP00013', isActive: true },
    { firstName: 'Djamila',   lastName: 'Ferroukhi',   email: 'd.ferroukhi@univ-ust.dz',     phone: '0550100014', department: 'Communication', position: 'autre',        employeeId: 'EMP00014', isActive: true },
    { firstName: 'Bilal',     lastName: 'Ouartsi',     email: 'b.ouartsi@univ-ust.dz',       phone: '0550100015', department: 'Sécurité',      position: 'autre',        employeeId: 'EMP00015', isActive: false },
  ];
  const createdStaff = [];
  for (const entry of staffEntries) {
    const s = new StaffModel({ ...entry, password: staffPassword, role: 'staff' });
    await s.save();
    createdStaff.push(s);
  }
  console.log(`   ✓ ${createdStaff.length} membres du personnel créés`);

  // ── 7. UEs ──────────────────────────────────────────────────
  console.log('\n📖 Unités d\'enseignement...');
  const ues = await UE.insertMany([
    { code: 'ALGO301', title: 'Algorithmique Avancée',              coefficient: 3, credits: 6, semester: 'S3', program: programs[0]._id, responsibleTeacher: teachers[0]._id, volumeHours: { cm: 21, td: 21, tp: 10 }, isActive: true, evaluationWeights: { cc: 40, partiel: 20, final: 40 } },
    { code: 'BD301',   title: 'Bases de données relationnelles',      coefficient: 3, credits: 6, semester: 'S3', program: programs[0]._id, responsibleTeacher: teachers[1]._id, volumeHours: { cm: 21, td: 21, tp: 21 }, isActive: true, evaluationWeights: { cc: 40, partiel: 20, final: 40 } },
    { code: 'RES301',  title: 'Réseaux Informatiques',               coefficient: 2, credits: 4, semester: 'S3', program: programs[0]._id, responsibleTeacher: teachers[2]._id, volumeHours: { cm: 21, td: 14, tp: 14 }, isActive: true, evaluationWeights: { cc: 40, partiel: 20, final: 40 } },
    { code: 'MATH301', title: 'Mathématiques pour l\'informatique',  coefficient: 2, credits: 4, semester: 'S3', program: programs[0]._id, responsibleTeacher: teachers[3]._id, volumeHours: { cm: 21, td: 21, tp: 0  }, isActive: true, evaluationWeights: { cc: 40, partiel: 20, final: 40 } },
    { code: 'GL501',   title: 'Génie Logiciel Avancé',               coefficient: 4, credits: 8, semester: 'S1', program: programs[1]._id, responsibleTeacher: teachers[0]._id, volumeHours: { cm: 21, td: 21, tp: 21 }, isActive: true, evaluationWeights: { cc: 40, partiel: 20, final: 40 } },
    { code: 'WEB501',  title: 'Développement Web Full Stack',         coefficient: 3, credits: 6, semester: 'S1', program: programs[1]._id, responsibleTeacher: teachers[4]._id, volumeHours: { cm: 14, td: 14, tp: 28 }, isActive: true, evaluationWeights: { cc: 50, partiel: 0,  final: 50 } },
  ]);
  console.log(`   ✓ ${ues.length} UEs créées`);

  // ── 8. COURS ─────────────────────────────────────────────────
  console.log('\n📝 Cours...');
  const courses = await Course.insertMany([
    { title: 'Algorithmique Avancée – CM',       code: 'ALGO301-CM',    type: 'CM', ue: ues[0]._id, teacher: teachers[0]._id, program: programs[0]._id, semester: 'S3', academicYear: YEAR, groups: [],     totalHours: 21, isActive: true },
    { title: 'Algorithmique Avancée – TD G1',    code: 'ALGO301-TD-G1', type: 'TD', ue: ues[0]._id, teacher: teachers[0]._id, program: programs[0]._id, semester: 'S3', academicYear: YEAR, groups: ['G1'], totalHours: 21, isActive: true },
    { title: 'Algorithmique Avancée – TP G1',    code: 'ALGO301-TP-G1', type: 'TP', ue: ues[0]._id, teacher: teachers[0]._id, program: programs[0]._id, semester: 'S3', academicYear: YEAR, groups: ['G1'], totalHours: 10, isActive: true },
    { title: 'Bases de données – CM',            code: 'BD301-CM',      type: 'CM', ue: ues[1]._id, teacher: teachers[1]._id, program: programs[0]._id, semester: 'S3', academicYear: YEAR, groups: [],     totalHours: 21, isActive: true },
    { title: 'Bases de données – TD G1',         code: 'BD301-TD-G1',   type: 'TD', ue: ues[1]._id, teacher: teachers[1]._id, program: programs[0]._id, semester: 'S3', academicYear: YEAR, groups: ['G1'], totalHours: 21, isActive: true },
    { title: 'Bases de données – TP G1',         code: 'BD301-TP-G1',   type: 'TP', ue: ues[1]._id, teacher: teachers[1]._id, program: programs[0]._id, semester: 'S3', academicYear: YEAR, groups: ['G1'], totalHours: 21, isActive: true },
    { title: 'Réseaux Informatiques – CM',       code: 'RES301-CM',     type: 'CM', ue: ues[2]._id, teacher: teachers[2]._id, program: programs[0]._id, semester: 'S3', academicYear: YEAR, groups: [],     totalHours: 21, isActive: true },
    { title: 'Génie Logiciel Avancé – CM',       code: 'GL501-CM',      type: 'CM', ue: ues[4]._id, teacher: teachers[0]._id, program: programs[1]._id, semester: 'S1', academicYear: YEAR, groups: [],     totalHours: 21, isActive: true },
    { title: 'Développement Web Full Stack – TP',code: 'WEB501-TP',     type: 'TP', ue: ues[5]._id, teacher: teachers[4]._id, program: programs[1]._id, semester: 'S1', academicYear: YEAR, groups: ['G1'], totalHours: 28, isActive: true },
  ]);
  console.log(`   ✓ ${courses.length} cours créés`);

  // ── 9. EMPLOI DU TEMPS ───────────────────────────────────────
  console.log('\n🗓️  Emploi du temps...');
  await Schedule.insertMany([
    { course: courses[0]._id, teacher: teachers[0]._id, room: 'AMPHI-A',   program: programs[0]._id, academicYear: YEAR, semester: 'S3',         dayOfWeek: 1, startTime: '08:00', endTime: '10:00', startDate: new Date('2024-09-16'), endDate: new Date('2025-01-31'), isRecurring: true },
    { course: courses[1]._id, teacher: teachers[0]._id, room: 'TD-101',    program: programs[0]._id, academicYear: YEAR, semester: 'S3', group: 'G1', dayOfWeek: 1, startTime: '10:00', endTime: '12:00', startDate: new Date('2024-09-16'), endDate: new Date('2025-01-31'), isRecurring: true },
    { course: courses[2]._id, teacher: teachers[0]._id, room: 'TP-INFO-1', program: programs[0]._id, academicYear: YEAR, semester: 'S3', group: 'G1', dayOfWeek: 2, startTime: '08:00', endTime: '10:00', startDate: new Date('2024-09-17'), endDate: new Date('2025-01-31'), isRecurring: true },
    { course: courses[3]._id, teacher: teachers[1]._id, room: 'AMPHI-B',   program: programs[0]._id, academicYear: YEAR, semester: 'S3',         dayOfWeek: 2, startTime: '10:00', endTime: '12:00', startDate: new Date('2024-09-17'), endDate: new Date('2025-01-31'), isRecurring: true },
    { course: courses[4]._id, teacher: teachers[1]._id, room: 'TD-102',    program: programs[0]._id, academicYear: YEAR, semester: 'S3', group: 'G1', dayOfWeek: 3, startTime: '08:00', endTime: '10:00', startDate: new Date('2024-09-18'), endDate: new Date('2025-01-31'), isRecurring: true },
    { course: courses[7]._id, teacher: teachers[0]._id, room: 'AMPHI-A',   program: programs[1]._id, academicYear: YEAR, semester: 'S1',         dayOfWeek: 4, startTime: '08:00', endTime: '10:00', startDate: new Date('2024-09-19'), endDate: new Date('2025-01-31'), isRecurring: true },
    { course: courses[8]._id, teacher: teachers[4]._id, room: 'TP-INFO-1', program: programs[1]._id, academicYear: YEAR, semester: 'S1', group: 'G1', dayOfWeek: 4, startTime: '14:00', endTime: '17:00', startDate: new Date('2024-09-19'), endDate: new Date('2025-01-31'), isRecurring: true },
  ]);
  console.log('   ✓ Emploi du temps créé');

  // ── 10. INSCRIPTIONS ─────────────────────────────────────────
  console.log('\n📋 Inscriptions...');
  const enrollmentDocs = [];
  for (const student of studentsL2Info) {
    for (const ue of ues.slice(0, 4)) {
      enrollmentDocs.push({ student: student._id, ue: ue._id, program: programs[0]._id, academicYear: YEAR, semester: 'S3', group: 'G1', status: 'enrolled' });
    }
  }
  for (const student of studentsM1GL) {
    for (const ue of ues.slice(4)) {
      enrollmentDocs.push({ student: student._id, ue: ue._id, program: programs[1]._id, academicYear: YEAR, semester: 'S1', group: 'G1', status: 'enrolled' });
    }
  }
  await Enrollment.insertMany(enrollmentDocs);
  console.log(`   ✓ ${enrollmentDocs.length} inscriptions créées`);

  // ── 11. NOTES ────────────────────────────────────────────────
  console.log('\n🏅 Notes...');
  const gradeDocs = [];
  const gradeData = [
    { student: studentsL2Info[0], scores: { ALGO301: { cc1:15, cc2:16, final:14 }, BD301: { cc1:17, cc2:18, final:16 }, RES301: { cc1:12, cc2:13, final:11 }, MATH301: { cc1:14, cc2:15, final:13 } } },
    { student: studentsL2Info[1], scores: { ALGO301: { cc1:18, cc2:17, final:17 }, BD301: { cc1:19, cc2:18, final:18 }, RES301: { cc1:16, cc2:15, final:15 }, MATH301: { cc1:17, cc2:18, final:16 } } },
    { student: studentsL2Info[2], scores: { ALGO301: { cc1:9,  cc2:10, final:9  }, BD301: { cc1:11, cc2:10, final:10 }, RES301: { cc1:8,  cc2:9,  final:8  }, MATH301: { cc1:10, cc2:10, final:9  } } },
    { student: studentsL2Info[3], scores: { ALGO301: { cc1:13, cc2:14, final:12 }, BD301: { cc1:14, cc2:15, final:13 }, RES301: { cc1:11, cc2:12, final:10 }, MATH301: { cc1:12, cc2:13, final:11 } } },
    { student: studentsL2Info[4], scores: { ALGO301: { cc1:16, cc2:15, final:15 }, BD301: { cc1:13, cc2:14, final:13 }, RES301: { cc1:14, cc2:15, final:14 }, MATH301: { cc1:15, cc2:14, final:14 } } },
  ];
  const ueCodes = { ALGO301: ues[0], BD301: ues[1], RES301: ues[2], MATH301: ues[3] };

  for (const { student, scores } of gradeData) {
    for (const [ueCode, s] of Object.entries(scores)) {
      const ue = ueCodes[ueCode];
      const avg = parseFloat((s.cc1 * 0.2 + s.cc2 * 0.2 + s.final * 0.6).toFixed(2));
      gradeDocs.push({
        student: student._id, ue: ue._id, program: programs[0]._id,
        academicYear: YEAR, semester: 'S3', session: 'session1',
        assessments: [
          { type: 'CC',    label: 'CC1',        score: s.cc1,   maxScore: 20, weight: 20, date: daysAgo(60), enteredBy: teachers[0]._id },
          { type: 'CC',    label: 'CC2',        score: s.cc2,   maxScore: 20, weight: 20, date: daysAgo(30), enteredBy: teachers[0]._id },
          { type: 'FINAL', label: 'Examen S3',  score: s.final, maxScore: 20, weight: 60, date: daysAgo(10), enteredBy: teachers[0]._id },
        ],
        average: avg, finalAverage: avg, mention: getMention(avg),
        isValidated: avg >= 10, ectsObtained: avg >= 10 ? ue.credits : 0,
      });
    }
  }
  await Grade.insertMany(gradeDocs);
  console.log(`   ✓ ${gradeDocs.length} notes créées`);

  // ── 12. PRÉSENCES ────────────────────────────────────────────
  console.log('\n🕐 Présences...');
  const attendanceDocs = [];
  const attStatuses = ['present','present','present','present','absent','late','present'];
  for (let w = 0; w < 6; w++) {
    const date = daysAgo(7 * (w + 1) + 1);
    for (const student of studentsL2Info) {
      const status = attStatuses[(w + student.firstName.length) % attStatuses.length];
      attendanceDocs.push({
        student: student._id, course: courses[0]._id, teacher: teachers[0]._id, date, status,
        checkInTime: status === 'present' ? new Date(date.getTime() + 5 * 60000) : undefined,
        isJustified: status === 'absent' && w === 2,
        justificationReason: status === 'absent' && w === 2 ? 'Maladie — certificat médical fourni' : undefined,
        scannedViaQR: status === 'present' && w % 2 === 0,
      });
    }
  }
  await Attendance.insertMany(attendanceDocs);
  console.log(`   ✓ ${attendanceDocs.length} présences enregistrées`);

  // ── 13. DEVOIRS ──────────────────────────────────────────────
  console.log('\n📌 Devoirs...');
  const assignments = await Assignment.insertMany([
    { title: 'TP1 – Tri par fusion',         description: 'Implémenter le tri fusion en Python.',                     course: courses[2]._id, ue: ues[0]._id, teacher: teachers[0]._id, program: programs[0]._id, academicYear: YEAR, groups: ['G1'], dueDate: daysAgo(14),  maxScore: 20, type: 'tp',            isGroupWork: false, isPublished: true, publishedAt: daysAgo(28), weight: 20 },
    { title: 'Projet BD – Conception MCD',   description: 'Concevoir le MCD d\'un système de bibliothèque.',          course: courses[4]._id, ue: ues[1]._id, teacher: teachers[1]._id, program: programs[0]._id, academicYear: YEAR, groups: ['G1'], dueDate: daysNext(7),  maxScore: 20, type: 'projet',        isGroupWork: true,  isPublished: true, publishedAt: daysAgo(14), weight: 30 },
    { title: 'DM – Algorithmes de graphes',  description: 'Exercices sur Dijkstra et Bellman-Ford.',                   course: courses[1]._id, ue: ues[0]._id, teacher: teachers[0]._id, program: programs[0]._id, academicYear: YEAR, groups: ['G1'], dueDate: daysNext(14), maxScore: 20, type: 'devoir_maison', isGroupWork: false, isPublished: true, publishedAt: daysAgo(7),  weight: 20 },
    { title: 'Projet Full Stack – API REST', description: 'Développer une API REST avec Node.js et MongoDB.',          course: courses[8]._id, ue: ues[5]._id, teacher: teachers[4]._id, program: programs[1]._id, academicYear: YEAR, groups: ['G1'], dueDate: daysNext(21), maxScore: 20, type: 'projet',        isGroupWork: true,  isPublished: true, publishedAt: daysAgo(7),  weight: 50 },
  ]);
  const submissions = [];
  for (const student of studentsL2Info) {
    const score = Math.round(10 + Math.random() * 9);
    submissions.push({
      assignment: assignments[0]._id, student: student._id,
      submittedAt: daysAgo(16), isLate: false,
      files: [{ name: 'tri_fusion.py', url: `/uploads/${student.studentId}/tri_fusion.py`, size: 2048 }],
      comment: 'Implémentation complète avec tests unitaires.',
      score, maxScore: 20, feedback: score >= 15 ? 'Excellent !' : 'Des améliorations sont possibles.',
      correctedBy: teachers[0]._id, correctedAt: daysAgo(10), status: 'graded',
    });
  }
  await Submission.insertMany(submissions);
  console.log(`   ✓ ${assignments.length} devoirs, ${submissions.length} soumissions`);

  // ── 14. FRAIS & PAIEMENTS ────────────────────────────────────
  console.log('\n💰 Frais et paiements...');
  const fees = [];
  for (const student of allStudents) {
    const isM1 = studentsM1GL.some(s => s._id.equals(student._id));
    const scolarityFee = isM1 ? 25000 : 20000;
    const paid = Math.random() > 0.3;
    fees.push({
      student: student._id, academicYear: YEAR,
      items: [
        { category: 'inscription',  label: 'Frais d\'inscription', amount: 3000,        dueDate: new Date('2024-09-30'), isPaid: true },
        { category: 'scolarite',    label: 'Frais de scolarité',   amount: scolarityFee, dueDate: new Date('2024-10-31'), isPaid: paid },
        { category: 'bibliotheque', label: 'Accès bibliothèque',   amount: 500,          dueDate: new Date('2024-10-31'), isPaid: true },
      ],
      totalAmount: scolarityFee + 3500, paidAmount: paid ? scolarityFee + 3500 : 3500,
      remainingAmount: paid ? 0 : scolarityFee, scholarshipAmount: 0, status: paid ? 'paid' : 'partial',
    });
  }
  const createdFees = await Fee.insertMany(fees);
  const payments = [];
  for (let i = 0; i < createdFees.length; i++) {
    const fee = createdFees[i];
    if (fee.paidAmount > 0) {
      payments.push({
        fee: fee._id, student: fee.student, amount: fee.paidAmount,
        method: ['cash','virement','ccp'][i % 3],
        transactionId: `TXN-${Date.now()}-${i}`,
        receiptNumber: `REC-${YEAR}-${String(i + 1).padStart(4,'0')}`,
        paymentDate: daysAgo(30 + i), recordedBy: staffUsersDocs[2]._id,
      });
    }
  }
  await Payment.insertMany(payments);
  console.log(`   ✓ ${createdFees.length} fiches de frais, ${payments.length} paiements`);

  // ── 15. BOURSES ──────────────────────────────────────────────
  await Scholarship.insertMany([
    { student: studentsL2Info[1]._id, type: 'bourse_excellence', label: 'Bourse d\'excellence L2', percentage: 50, academicYear: YEAR, startDate: new Date('2024-09-01'), endDate: new Date('2025-07-31'), isActive: true, approvedBy: admin._id },
    { student: studentsL2Info[2]._id, type: 'aide_sociale',      label: 'Aide sociale',            amount: 8000,  academicYear: YEAR, startDate: new Date('2024-09-01'), endDate: new Date('2025-07-31'), isActive: true, approvedBy: admin._id },
  ]);
  console.log('   ✓ 2 bourses créées');

  // ── 16. ENTREPRISES ──────────────────────────────────────────
  await Company.insertMany([
    { name: 'Algérie Télécom',    sector: 'Télécommunications', phone: '+213 21 10 00 00', email: 'rh@algerietelecom.dz', contact: { name: 'M. Ferhat',   position: 'DRH' }, isActive: true, totalInterns: 45 },
    { name: 'Sonatrach Digital',  sector: 'Énergie / Numérique',phone: '+213 21 54 00 00', email: 'digital@sonatrach.dz', contact: { name: 'Mme. Amrani', position: 'Responsable Innovation' }, isActive: true, totalInterns: 30 },
    { name: 'Condor Electronics', sector: 'Électronique',        phone: '+213 35 60 00 00', email: 'rh@condor.dz',         contact: { name: 'M. Benali',   position: 'Chef de projet' }, isActive: true, totalInterns: 20 },
    { name: 'Djezzy',             sector: 'Télécommunications', phone: '+213 770 00 00 00', email: 'rh@djezzy.dz',         contact: { name: 'Mme. Khelil', position: 'DRH' }, isActive: true, totalInterns: 60 },
  ]);
  console.log('   ✓ 4 entreprises créées');

  // ── 17. NOTIFICATIONS ────────────────────────────────────────
  await Notification.insertMany([
    { recipientRole: 'student', sender: admin._id, type: 'info',    title: 'Début du semestre S3',              message: 'Les cours du semestre S3 débutent le 16 septembre 2024.', link: '/emploi-du-temps', isBroadcast: true, isRead: false },
    { recipientRole: 'student', sender: admin._id, type: 'warning', title: 'Rappel : Dépôt dossiers de bourse', message: 'Le dépôt des dossiers se termine le 30 octobre 2024.',    link: '/bourses',        isBroadcast: true, isRead: false },
    { recipient: studentsL2Info[0]._id, sender: teachers[0]._id, type: 'info',    title: 'Note TP1 disponible',   message: 'Votre note TP1 Algorithmique est disponible : 15/20.', link: '/mes-notes',    isRead: false },
    { recipient: studentsL2Info[2]._id, sender: teachers[0]._id, type: 'warning', title: 'Taux d\'absence élevé', message: 'Votre taux d\'absence dépasse le seuil autorisé.',     link: '/mes-absences', isRead: false },
    { recipientRole: 'teacher', sender: admin._id, type: 'info', title: 'Conseil de département — 15 nov.', message: 'Le conseil aura lieu le 15 novembre à 10h.', isBroadcast: true, isRead: false },
    { recipient: studentsL2Info[1]._id, sender: admin._id, type: 'success', title: 'Bourse attribuée', message: 'Votre bourse a été approuvée pour 2024-2025.', link: '/ma-bourse', isRead: true },
  ]);
  console.log('   ✓ 6 notifications créées');

  // ── 18. ÉVÉNEMENTS ───────────────────────────────────────────
  await Event.insertMany([
    { title: 'Journée Portes Ouvertes 2024',      type: 'ceremony',   startDate: daysNext(15), endDate: daysNext(15), location: 'Campus principal',   room: rooms[6]._id, organizer: admin._id,       isPublic: true,  targetRoles: ['admin','staff','teacher'], maxParticipants: 500, registrationRequired: false, isActive: true },
    { title: 'Hackathon Informatique 2025',        type: 'cultural',   startDate: daysNext(30), endDate: daysNext(31), location: 'Bloc C – Salles TP',               organizer: deptHeads[0]._id, isPublic: true,  targetRoles: ['student'],                maxParticipants: 80,  registrationRequired: true,  isActive: true },
    { title: 'Soutenance de mémoires M2',          type: 'soutenance', startDate: daysNext(45), endDate: daysNext(46), location: 'Amphithéâtre A',    room: rooms[0]._id, organizer: deptHeads[0]._id, isPublic: false, targetRoles: ['teacher','admin'],         maxParticipants: 50,  registrationRequired: false, isActive: true },
    { title: 'Conférence IA & Avenir du Numérique',type: 'conference', startDate: daysNext(20), endDate: daysNext(20), location: 'Amphithéâtre B',    room: rooms[1]._id, organizer: deptHeads[0]._id, isPublic: true,  targetRoles: ['student','teacher'],       maxParticipants: 150, registrationRequired: true,  isActive: true },
  ]);
  console.log('   ✓ 4 événements créés');

  // ── 19. RELEVÉS DE NOTES ─────────────────────────────────────
  console.log('\n📄 Relevés de notes...');
  const transcripts = [];
  for (const student of studentsL2Info) {
    const ueGrades = [];
    let totalCoeff = 0, weightedSum = 0, totalECTS = 0;
    for (const ue of ues.slice(0, 4)) {
      const grade = gradeDocs.find(g => g.student.equals(student._id) && g.ue.equals(ue._id));
      if (grade) {
        const validated = grade.average >= 10;
        ueGrades.push({ ue: ue._id, ueCode: ue.code, ueTitle: ue.title, coefficient: ue.coefficient, credits: ue.credits, average: grade.average, mention: getMention(grade.average), isValidated: validated, ectsObtained: validated ? ue.credits : 0 });
        weightedSum += grade.average * ue.coefficient;
        totalCoeff  += ue.coefficient;
        if (validated) totalECTS += ue.credits;
      }
    }
    const semAvg = parseFloat((weightedSum / totalCoeff).toFixed(2));
    transcripts.push({ student: student._id, program: programs[0]._id, academicYear: YEAR, semester: 'S3', ueGrades, semesterAverage: semAvg, totalECTS, mention: getMention(semAvg), rank: 0, totalStudents: studentsL2Info.length, generatedAt: daysAgo(5), validatedBy: admin._id, isSigned: true });
  }
  transcripts.sort((a, b) => b.semesterAverage - a.semesterAverage);
  transcripts.forEach((t, i) => { t.rank = i + 1; });
  await Transcript.insertMany(transcripts);
  console.log(`   ✓ ${transcripts.length} relevés de notes`);

  // ── 20. DÉLIBÉRATIONS ────────────────────────────────────────
  const delibs = transcripts.map((t, i) => ({
    student: t.student, program: programs[0]._id, academicYear: YEAR,
    session: 'principale', generalAverage: t.semesterAverage, mention: t.mention,
    validated: t.semesterAverage >= 10, validatedAt: daysAgo(3), validatedBy: admin._id,
    remarks: t.semesterAverage >= 16 ? 'Félicitations du jury' : t.semesterAverage >= 10 ? 'Admis' : 'Ajourné',
    certificateGenerated: t.semesterAverage >= 10,
    certificateNumber: t.semesterAverage >= 10 ? `CERT-${YEAR}-${String(i + 1).padStart(4,'0')}` : undefined,
  }));
  await Deliberation.insertMany(delibs);
  console.log(`   ✓ ${delibs.length} délibérations créées`);

  // ── 21. DIPLÔMES ─────────────────────────────────────────────
  const topStudents = transcripts.filter(t => t.semesterAverage >= 14);
  if (topStudents.length > 0) {
    await Diploma.insertMany(topStudents.map((t, i) => ({
      student: t.student, program: programs[0]._id,
      diplomaNumber: `DIP-${YEAR}-${String(i + 1).padStart(4,'0')}`,
      graduationDate: new Date('2025-07-15'), academicYear: YEAR,
      generalAverage: t.semesterAverage, mention: t.mention, totalECTS: t.totalECTS,
      validatedBy: admin._id, validatedAt: daysAgo(2), isIssued: false,
    })));
    console.log(`   ✓ ${topStudents.length} diplôme(s) initialisé(s)`);
  }

  // ══════════════════════════════════════════════════════════════
  // ✅ 22. EXAMENS
  // ══════════════════════════════════════════════════════════════
  console.log('\n📝 Examens...');

  const exams = await Exam.insertMany([

    // ── L2 Informatique — Session 1 — Partiels (passés) ───────
    {
      title:        'Partiel Algorithmique Avancée S3',
      ue:           ues[0]._id,
      course:       courses[0]._id,
      program:      programs[0]._id,
      academicYear: YEAR,
      session:      'session1',
      type:         'partiel',
      startDate:    daysAgo(45),
      endDate:      new Date(daysAgo(45).getTime() + 90 * 60000),
      duration:     90,
      room:         rooms[0]._id,
      supervisors:  [teachers[0]._id, teachers[3]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  1,
      instructions: 'Documents interdits. Calculatrice non autorisée. Répondre sur la copie.',
      isPublished:  true,
      status:       'completed',
    },
    {
      title:        'Partiel Bases de données S3',
      ue:           ues[1]._id,
      course:       courses[3]._id,
      program:      programs[0]._id,
      academicYear: YEAR,
      session:      'session1',
      type:         'partiel',
      startDate:    daysAgo(42),
      endDate:      new Date(daysAgo(42).getTime() + 90 * 60000),
      duration:     90,
      room:         rooms[1]._id,
      supervisors:  [teachers[1]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  1,
      instructions: 'Documents interdits. Seul le formulaire SQL fourni est autorisé.',
      isPublished:  true,
      status:       'completed',
    },
    {
      title:        'Partiel Réseaux Informatiques S3',
      ue:           ues[2]._id,
      course:       courses[6]._id,
      program:      programs[0]._id,
      academicYear: YEAR,
      session:      'session1',
      type:         'partiel',
      startDate:    daysAgo(40),
      endDate:      new Date(daysAgo(40).getTime() + 90 * 60000),
      duration:     90,
      room:         rooms[2]._id,
      supervisors:  [teachers[2]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  1,
      instructions: 'Cours et TD autorisés. Aucun appareil électronique.',
      isPublished:  true,
      status:       'completed',
    },

    // ── L2 Informatique — Session 1 — Finaux (à venir) ────────
    {
      title:        'Examen Final Algorithmique Avancée S3',
      ue:           ues[0]._id,
      course:       courses[0]._id,
      program:      programs[0]._id,
      academicYear: YEAR,
      session:      'session1',
      type:         'final',
      startDate:    daysNext(10),
      endDate:      new Date(daysNext(10).getTime() + 120 * 60000),
      duration:     120,
      room:         rooms[0]._id,
      supervisors:  [teachers[0]._id, teachers[3]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  2,
      instructions: 'Documents interdits. Calculatrice scientifique autorisée. 4 exercices obligatoires.',
      isPublished:  true,
      status:       'planned',
    },
    {
      title:        'Examen Final Bases de données S3',
      ue:           ues[1]._id,
      course:       courses[3]._id,
      program:      programs[0]._id,
      academicYear: YEAR,
      session:      'session1',
      type:         'final',
      startDate:    daysNext(12),
      endDate:      new Date(daysNext(12).getTime() + 120 * 60000),
      duration:     120,
      room:         rooms[1]._id,
      supervisors:  [teachers[1]._id, teachers[2]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  2,
      instructions: 'Examen pratique + théorie. Formulaire SQL fourni. PC non autorisé.',
      isPublished:  true,
      status:       'planned',
    },
    {
      title:        'Examen Final Réseaux Informatiques S3',
      ue:           ues[2]._id,
      course:       courses[6]._id,
      program:      programs[0]._id,
      academicYear: YEAR,
      session:      'session1',
      type:         'final',
      startDate:    daysNext(15),
      endDate:      new Date(daysNext(15).getTime() + 90 * 60000),
      duration:     90,
      room:         rooms[2]._id,
      supervisors:  [teachers[2]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  2,
      instructions: 'Documents autorisés (cours + TD uniquement). Calculatrice non autorisée.',
      isPublished:  true,
      status:       'planned',
    },
    {
      title:        'Examen Final Mathématiques Informatique S3',
      ue:           ues[3]._id,
      program:      programs[0]._id,
      academicYear: YEAR,
      session:      'session1',
      type:         'final',
      startDate:    daysNext(18),
      endDate:      new Date(daysNext(18).getTime() + 120 * 60000),
      duration:     120,
      room:         rooms[0]._id,
      supervisors:  [teachers[3]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  2,
      instructions: 'Documents interdits. Formulaire de mathématiques fourni. Calculatrice autorisée.',
      isPublished:  true,
      status:       'planned',
    },

    // ── TP noté Algorithmique (passé + publié) ─────────────────
    {
      title:        'TP Noté — Algorithmique Avancée',
      ue:           ues[0]._id,
      course:       courses[2]._id,
      program:      programs[0]._id,
      academicYear: YEAR,
      session:      'session1',
      type:         'tp',
      startDate:    daysAgo(20),
      endDate:      new Date(daysAgo(20).getTime() + 120 * 60000),
      duration:     120,
      room:         rooms[4]._id,
      supervisors:  [teachers[0]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  1,
      instructions: 'Travail individuel sur machine. Langage Python. Soumission via Moodle.',
      isPublished:  true,
      status:       'completed',
    },

    // ── Master GL — Session 1 — Final (à venir) ────────────────
    {
      title:        'Examen Final Génie Logiciel Avancé',
      ue:           ues[4]._id,
      course:       courses[7]._id,
      program:      programs[1]._id,
      academicYear: YEAR,
      session:      'session1',
      type:         'final',
      startDate:    daysNext(14),
      endDate:      new Date(daysNext(14).getTime() + 180 * 60000),
      duration:     180,
      room:         rooms[1]._id,
      supervisors:  [teachers[0]._id, teachers[4]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  3,
      instructions: 'Examen sur cas d\'étude. Notation UML autorisée. Cours interdits.',
      isPublished:  true,
      status:       'planned',
    },
    {
      title:        'Projet Final — Développement Web Full Stack',
      ue:           ues[5]._id,
      course:       courses[8]._id,
      program:      programs[1]._id,
      academicYear: YEAR,
      session:      'session1',
      type:         'projet',
      startDate:    daysNext(21),
      endDate:      new Date(daysNext(21).getTime() + 240 * 60000),
      duration:     240,
      room:         rooms[4]._id,
      supervisors:  [teachers[4]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  3,
      instructions: 'Soutenance de projet en binôme. Démo obligatoire. Code source à remettre avant 8h.',
      isPublished:  true,
      status:       'planned',
    },

    // ── Rattrapage (non publié — planifié) ────────────────────
    {
      title:        'Rattrapage Algorithmique Avancée',
      ue:           ues[0]._id,
      course:       courses[0]._id,
      program:      programs[0]._id,
      academicYear: YEAR,
      session:      'rattrapage',
      type:         'rattrapage',
      startDate:    daysNext(40),
      endDate:      new Date(daysNext(40).getTime() + 120 * 60000),
      duration:     120,
      room:         rooms[2]._id,
      supervisors:  [teachers[0]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  1,
      instructions: 'Réservé aux étudiants n\'ayant pas validé la session 1.',
      isPublished:  false,
      status:       'planned',
    },
    {
      title:        'Rattrapage Bases de données',
      ue:           ues[1]._id,
      course:       courses[3]._id,
      program:      programs[0]._id,
      academicYear: YEAR,
      session:      'rattrapage',
      type:         'rattrapage',
      startDate:    daysNext(42),
      endDate:      new Date(daysNext(42).getTime() + 120 * 60000),
      duration:     120,
      room:         rooms[3]._id,
      supervisors:  [teachers[1]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  1,
      instructions: 'Réservé aux étudiants ajournés. Documents interdits.',
      isPublished:  false,
      status:       'planned',
    },

    // ── Oral Master ───────────────────────────────────────────
    {
      title:        'Oral de Soutenance — Projet Génie Logiciel',
      ue:           ues[4]._id,
      program:      programs[1]._id,
      academicYear: YEAR,
      session:      'session1',
      type:         'oral',
      startDate:    daysNext(35),
      endDate:      new Date(daysNext(35).getTime() + 60 * 60000),
      duration:     60,
      room:         rooms[6]._id,
      supervisors:  [teachers[0]._id, deptHeads[0]._id],
      groups:       ['G1'],
      maxScore:     20,
      coefficient:  2,
      instructions: 'Présentation de 20 min + 10 min questions. Support PowerPoint obligatoire.',
      isPublished:  false,
      status:       'planned',
    },
  ]);

  console.log(`   ✓ ${exams.length} examens créés`);

  // ─── RÉSUMÉ FINAL ─────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('✅  SEED TERMINÉ AVEC SUCCÈS');
  console.log('═'.repeat(60));
  console.log('\n📊 Résumé :');
  console.log(`   👤 Utilisateurs   : 1 superadmin · 1 admin · ${staffUsersDocs.length} staff · ${deptHeads.length} chefs · ${teachers.length} enseignants · ${allStudents.length} étudiants`);
  console.log(`   🧑‍💼 Personnel Staff : ${createdStaff.length} membres`);
  console.log(`   📚 Programmes     : ${programs.length}`);
  console.log(`   📖 UEs            : ${ues.length}`);
  console.log(`   📝 Cours          : ${courses.length}`);
  console.log(`   📝 Examens        : ${exams.length} (${exams.filter(e => e.status === 'completed').length} terminés · ${exams.filter(e => e.status === 'planned').length} planifiés)`);
  console.log(`   🏛️  Salles         : ${rooms.length}`);
  console.log(`   📋 Inscriptions   : ${enrollmentDocs.length}`);
  console.log(`   🏅 Notes          : ${gradeDocs.length}`);
  console.log(`   🕐 Présences      : ${attendanceDocs.length}`);
  console.log(`   📌 Devoirs        : ${assignments.length}`);
  console.log(`   💰 Frais          : ${createdFees.length} · Paiements : ${payments.length}`);
  console.log(`   🏢 Entreprises    : 4 · 🔔 Notifications : 6 · 🎉 Événements : 4`);
  console.log(`   📄 Relevés        : ${transcripts.length} · ⚖️ Délibérations : ${delibs.length}`);
  console.log('\n🔑 Comptes de test :');
  console.log('   superadmin@univ-ust.dz     → password123  (SuperAdmin)');
  console.log('   admin@univ-ust.dz          → password123  (Admin)');
  console.log('   y.amrani@univ-ust.dz       → password123  (Enseignant — superviseur examens)');
  console.log('   a.mansouri@etu.univ-ust.dz → password123  (Étudiant L2)');
  console.log('   r.boussaid@etu.univ-ust.dz → password123  (Étudiante M1)');
  console.log('\n📝 Examens créés :');
  console.log('   • 3 partiels terminés (L2 Info — session1)');
  console.log('   • 4 finaux planifiés  (L2 Info — session1) — publiés ✓');
  console.log('   • 1 TP noté terminé   (L2 Info)');
  console.log('   • 2 finaux planifiés  (Master GL) — publiés ✓');
  console.log('   • 2 rattrapages       (non publiés)');
  console.log('   • 1 oral soutenance   (Master GL — non publié)');
  console.log('');

  await mongoose.disconnect();
  console.log('🔌 Déconnecté\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erreur seed :', err);
  mongoose.disconnect();
  process.exit(1);
});