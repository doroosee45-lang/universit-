// seedJury.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_db';

// ─── Connexion ───────────────────────────────────────────────────────────
async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connecté à MongoDB :', MONGO_URI);
}

// ─── Schémas (pour éviter les erreurs si les modèles ne sont pas encore enregistrés) ──
// On importe les modèles réels, mais si le seed est exécuté seul, on les définit ici.
let User, Jury;

try {
  User = mongoose.model('User');
} catch (e) {
  // Définition minimale pour que le seed fonctionne de manière autonome
  const UserSchema = new mongoose.Schema({
    firstName: String, lastName: String, email: String,
    password: String, role: String, isActive: Boolean,
    studentId: String, program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' }
  });
  User = mongoose.model('User', UserSchema);
}

try {
  Jury = mongoose.model('Jury');
} catch (e) {
  const jurySchema = new mongoose.Schema({
    academicYear: { type: String, required: true },
    session: { type: String, enum: ['principale', 'rattrapage'], required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  Jury = mongoose.model('Jury', jurySchema);
}

// ─── Helpers ─────────────────────────────────────────────────────────────
const hashPassword = async (pwd) => bcrypt.hash(pwd, 10);

// ─── Seed principal ──────────────────────────────────────────────────────
async function seedJury() {
  await connectDB();

  console.log('\n🗑️  Suppression des anciens jurys...');
  await Jury.deleteMany({});
  console.log('   ✓ Collection jury vidée');

  // 1. S’assurer qu’il existe au moins 3 enseignants
  let teachers = await User.find({ role: 'teacher' }).limit(5);
  if (teachers.length === 0) {
    console.log('\n⚠️  Aucun enseignant trouvé. Création d\'enseignants de test...');
    const pwd = await hashPassword('password123');
    teachers = await User.insertMany([
      { firstName: 'Yacine', lastName: 'Amrani', email: 'y.amrani@univ-ust.dz', password: pwd, role: 'teacher', isActive: true },
      { firstName: 'Samia', lastName: 'Ouali', email: 's.ouali@univ-ust.dz', password: pwd, role: 'teacher', isActive: true },
      { firstName: 'Hocine', lastName: 'Belkacemi', email: 'h.belkacemi@univ-ust.dz', password: pwd, role: 'teacher', isActive: true },
      { firstName: 'Meriem', lastName: 'Hadj', email: 'm.hadj@univ-ust.dz', password: pwd, role: 'teacher', isActive: true },
      { firstName: 'Sofiane', lastName: 'Rezki', email: 's.rezki@univ-ust.dz', password: pwd, role: 'teacher', isActive: true },
    ]);
    console.log(`   ✓ ${teachers.length} enseignants créés`);
  } else {
    console.log(`\n👥 ${teachers.length} enseignants trouvés dans la base`);
  }

  // 2. Création des jurys pour différentes années / sessions
  const juryConfigs = [
    { academicYear: '2023-2024', session: 'principale', memberIndices: [0, 1, 2] },
    { academicYear: '2023-2024', session: 'rattrapage', memberIndices: [0, 3] },
    { academicYear: '2024-2025', session: 'principale', memberIndices: [0, 1, 2, 4] },
    { academicYear: '2024-2025', session: 'rattrapage', memberIndices: [1, 3] },
    { academicYear: '2025-2026', session: 'principale', memberIndices: [0, 1, 2, 3, 4] },
  ];

  const createdBy = teachers[0]._id; // le premier enseignant comme créateur

  const juryDocs = [];
  for (const cfg of juryConfigs) {
    const members = cfg.memberIndices.map(i => teachers[i]._id);
    juryDocs.push({
      academicYear: cfg.academicYear,
      session: cfg.session,
      members,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const inserted = await Jury.insertMany(juryDocs);
  console.log(`\n✅ ${inserted.length} jurys créés :`);
  inserted.forEach(j => {
    console.log(`   - ${j.academicYear} / ${j.session} : ${j.members.length} membre(s)`);
  });

  console.log('\n📊 Résumé :');
  console.log(`   Enseignants disponibles : ${teachers.length}`);
  console.log(`   Jurys créés : ${inserted.length}`);
  console.log('\n🔑 Enseignants de test (si créés) :');
  console.log('   y.amrani@univ-ust.dz → password123');
  console.log('   s.ouali@univ-ust.dz → password123');
  console.log('   etc.');

  await mongoose.disconnect();
  console.log('\n🔌 Déconnecté\n');
  process.exit(0);
}

seedJury().catch(err => {
  console.error('❌ Erreur seed :', err);
  mongoose.disconnect();
  process.exit(1);
});