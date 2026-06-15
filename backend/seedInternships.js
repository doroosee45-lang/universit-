// seedInternships.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_db';

// ─── Schémas minimaux (User, Program, Room) ─────────────────────────
const UserSchema = new mongoose.Schema({
  firstName: String, lastName: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['super_admin','admin','staff','department_head','teacher','student'] },
  phone: String, isActive: Boolean,
  studentId: { type: String, unique: true, sparse: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  level: String,
});
const User = mongoose.model('User', UserSchema);

const ProgramSchema = new mongoose.Schema({
  name: String, code: String, academicYear: String,
});
const Program = mongoose.model('Program', ProgramSchema);

const RoomSchema = new mongoose.Schema({
  name: String, code: String, building: String, capacity: Number,
});
const Room = mongoose.model('Room', RoomSchema);

// ─── Modèles Company et Internship (copie conforme) ─────────────────
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sector: String,
  address: { street: String, city: String, wilaya: String, postalCode: String },
  phone: String, email: String, website: String,
  contact: { name: String, position: String, phone: String, email: String },
  description: String,
  isActive: { type: Boolean, default: true },
  totalInterns: { type: Number, default: 0 }
}, { timestamps: true });
CompanySchema.index({ name: 'text' });
const Company = mongoose.model('Company', CompanySchema);

const InternshipSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  companyTutor: { name: String, position: String, email: String, phone: String },
  academicTutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  conventionUrl: String, reportUrl: String,
  companyScore: { type: Number, min: 0, max: 20 },
  academicScore: { type: Number, min: 0, max: 20 },
  finalScore: { type: Number, min: 0, max: 20 },
  defenseDate: Date,
  defenseRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  jury: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  juryReport: String,
  status: {
    type: String,
    enum: ['candidature', 'accepted', 'ongoing', 'report_submitted', 'defended', 'validated', 'failed'],
    default: 'candidature'
  },
  attestationUrl: String, notes: String
}, { timestamps: true });
InternshipSchema.index({ student: 1, academicYear: 1 });
InternshipSchema.index({ company: 1 });
InternshipSchema.index({ status: 1 });
const Internship = mongoose.model('Internship', InternshipSchema);

// ─── Helpers ──────────────────────────────────────────────────
const today = new Date();
const daysAgo = (n) => new Date(today - n * 86400000);
const daysFromNow = (n) => new Date(today.getTime() + n * 86400000);

// ─── Seed ─────────────────────────────────────────────────────
async function seedInternships() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connecté à MongoDB :', MONGO_URI);

  // 1. Suppression
  console.log('\n🗑️  Suppression des collections companies et internships...');
  try { await mongoose.connection.collection('companies').drop(); console.log('   ✓ companies supprimée'); } catch(e) { console.log('   ~ companies inexistante'); }
  try { await mongoose.connection.collection('internships').drop(); console.log('   ✓ internships supprimée'); } catch(e) { console.log('   ~ internships inexistante'); }

  // 2. Données de base (programme, étudiants, enseignants, salle)
  console.log('\n👥 Préparation des données de base...');
  let program = await Program.findOne();
  if (!program) program = await Program.create({ name: 'Master Génie Logiciel', code: 'M-GL', academicYear: '2024-2025' });

  let teachers = await User.find({ role: 'teacher' }).limit(2);
  if (teachers.length === 0) {
    const pwd = await bcrypt.hash('password123', 10);
    teachers = await User.insertMany([
      { firstName: 'Yacine', lastName: 'Amrani', email: 'y.amrani@univ.dz', password: pwd, role: 'teacher', employeeId: 'T001' },
      { firstName: 'Samia', lastName: 'Ouali', email: 's.ouali@univ.dz', password: pwd, role: 'teacher', employeeId: 'T002' },
    ]);
  }

  let students = await User.find({ role: 'student' }).limit(4);
  if (students.length === 0) {
    const pwd = await bcrypt.hash('password123', 10);
    students = await User.insertMany([
      { firstName: 'Rania', lastName: 'Boussaid', email: 'r.boussaid@etu.dz', password: pwd, role: 'student', program: program._id, level: 'M1', studentId: 'M24001' },
      { firstName: 'Ismail', lastName: 'Tebbal', email: 'i.tebbal@etu.dz', password: pwd, role: 'student', program: program._id, level: 'M1', studentId: 'M24002' },
      { firstName: 'Yasmine', lastName: 'Aouadi', email: 'y.aouadi@etu.dz', password: pwd, role: 'student', program: program._id, level: 'M2', studentId: 'M24003' },
      { firstName: 'Ayoub', lastName: 'Mansouri', email: 'a.mansouri@etu.dz', password: pwd, role: 'student', program: program._id, level: 'L3', studentId: 'L24001' },
    ]);
  }

  let room = await Room.findOne();
  if (!room) room = await Room.create({ name: 'Amphithéâtre A', code: 'AMPHI-A', building: 'Bloc A', capacity: 100 });

  // 3. Entreprises
  console.log('\n🏢 Création des entreprises...');
  const companies = await Company.insertMany([
    { name: 'Algérie Télécom', sector: 'Télécommunications', phone: '+213 21 10 00 00', email: 'contact@algerietelecom.dz', contact: { name: 'M. Ferhat', position: 'DRH' }, description: 'Opérateur télécom' },
    { name: 'Sonatrach Digital', sector: 'Énergie / Numérique', email: 'digital@sonatrach.dz', contact: { name: 'Mme. Amrani', position: 'Responsable Innovation' } },
    { name: 'Condor Electronics', sector: 'Électronique', email: 'rh@condor.dz', contact: { name: 'M. Benali', position: 'Chef de projet' } },
    { name: 'Djezzy', sector: 'Télécommunications', email: 'rh@djezzy.dz', contact: { name: 'Mme. Khelil', position: 'DRH' } },
    { name: 'Startup AI Lab', sector: 'Intelligence Artificielle', email: 'contact@ailab.dz', contact: { name: 'Dr. Mohamed', position: 'CEO' } },
  ]);
  console.log(`   ✓ ${companies.length} entreprises créées`);

  // 4. Stages
  console.log('\n📝 Création des stages...');
  const internships = [
    { student: students[0], company: companies[0], title: 'Stage Développement Full Stack', startDate: daysFromNow(15), endDate: daysFromNow(75), status: 'candidature', academicTutor: teachers[0] },
    { student: students[1], company: companies[1], title: 'Stage Data Science', startDate: daysFromNow(20), endDate: daysFromNow(80), status: 'accepted', academicTutor: teachers[1] },
    { student: students[2], company: companies[2], title: 'Stage Développement mobile', startDate: daysAgo(20), endDate: daysFromNow(30), status: 'ongoing', academicTutor: teachers[0], conventionUrl: 'https://bucket.dz/conv.pdf' },
    { student: students[0], company: companies[3], title: 'Stage Réseaux et Sécurité', startDate: daysAgo(60), endDate: daysAgo(10), status: 'report_submitted', academicTutor: teachers[0], reportUrl: 'https://bucket.dz/report.pdf' },
    { student: students[3], company: companies[4], title: 'Stage Intelligence Artificielle', startDate: daysAgo(90), endDate: daysAgo(20), status: 'defended', academicTutor: teachers[1], companyScore: 18, academicScore: 16, finalScore: 17, defenseDate: daysAgo(10), defenseRoom: room._id, jury: [teachers[0]._id, teachers[1]._id], juryReport: 'Très bon travail' },
    { student: students[1], company: companies[0], title: 'Stage Développement Backend', startDate: daysAgo(180), endDate: daysAgo(120), status: 'validated', academicTutor: teachers[0], companyScore: 17, academicScore: 15, finalScore: 16, defenseDate: daysAgo(110), defenseRoom: room._id, jury: [teachers[0]._id, teachers[1]._id], attestationUrl: 'https://bucket.dz/att.pdf' },
    { student: students[2], company: companies[1], title: 'Stage Analyse de données', startDate: daysAgo(200), endDate: daysAgo(140), status: 'failed', academicTutor: teachers[1], companyScore: 8, academicScore: 7, finalScore: 7.5, defenseDate: daysAgo(130), defenseRoom: room._id, jury: [teachers[0]._id, teachers[1]._id] },
  ];

  for (const s of internships) {
    s.program = program._id;
    s.academicYear = '2024-2025';
    s.companyTutor = { name: `Tuteur ${s.company.name}`, email: `tuteur@${s.company.name.replace(/\s/g,'')}.dz` };
  }
  const createdInternships = await Internship.insertMany(internships);

  // Mise à jour totalInterns des entreprises
  for (const comp of companies) {
    const count = await Internship.countDocuments({ company: comp._id, status: { $in: ['validated','defended','report_submitted','ongoing'] } });
    comp.totalInterns = count;
    await comp.save();
  }

  console.log(`   ✓ ${createdInternships.length} stages créés`);

  // 5. Résumé
  console.log('\n' + '═'.repeat(60));
  console.log('✅ SEED STAGES TERMINÉ');
  console.log(`🏢 Entreprises : ${companies.length}`);
  console.log(`📝 Stages : ${createdInternships.length}`);
  for (const st of ['candidature','accepted','ongoing','report_submitted','defended','validated','failed']) {
    const count = createdInternships.filter(i => i.status === st).length;
    if (count) console.log(`   - ${st} : ${count}`);
  }
  console.log('\n🔑 Exemples de connexion (si créés) : r.boussaid@etu.dz / password123');
  await mongoose.disconnect();
  process.exit(0);
}

seedInternships().catch(err => { console.error(err); process.exit(1); });