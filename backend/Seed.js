require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/database');

// ─── Connexion ────────────────────────────────────────────────────────────────
async function main() {
  await connectDB();

  // Import APRÈS connexion (les discriminators ont besoin de Mongoose connecté)
  const User = require('./models/User.model');

  console.log('🌱 Démarrage du seeder...\n');

  // ─── Suppression des anciens comptes de démo ──────────────────────────────
  const demoEmails = [
    'admin@uni.dz',
    'superadmin@uni.dz',
    'prof@uni.dz',
    'etud@uni.dz',
    'staff@uni.dz',
    'chef@uni.dz',
  ];
  await User.deleteMany({ email: { $in: demoEmails } });
  console.log('🗑️  Anciens comptes de démo supprimés.\n');

  const password = await bcrypt.hash('Pass@123', 12);

  const users = [
    // ── Super Admin ──────────────────────────────────────────────────────────
    {
      firstName: 'osee',
      lastName: 'meya',
      email: 'meya@gmail.com',
      password,
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
      superAdminLevel: 1,
      systemAccess: ['all'],
    },

    // ── Admin ────────────────────────────────────────────────────────────────
    {
      firstName: 'Ahmed',
      lastName: 'Benali',
      email: 'admin@uni.dz',
      password,
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      department: 'Administration',
      permissions: [],
    },

    // ── Staff ────────────────────────────────────────────────────────────────
    {
      firstName: 'Fatima',
      lastName: 'Zahra',
      email: 'staff@uni.dz',
      password,
      role: 'staff',
      isActive: true,
      isEmailVerified: true,
      position: 'scolarite',
      department: 'Scolarité',
    },

    // ── Teacher ──────────────────────────────────────────────────────────────
    {
      firstName: 'Karim',
      lastName: 'Meziane',
      email: 'prof@uni.dz',
      password,
      role: 'teacher',
      isActive: true,
      isEmailVerified: true,
    },

    // ── Student ──────────────────────────────────────────────────────────────
    {
      firstName: 'Youcef',
      lastName: 'Amrani',
      email: 'etud@uni.dz',
      password,
      role: 'student',
      isActive: true,
      isEmailVerified: true,
      level: 'L1',
      currentSemester: 'S1',
      academicYear: '2024-2025',
      enrollmentDate: new Date(),
    },
  ];

  // ─── Insertion directe (bypass du hook pre-save pour éviter double hash) ──
  // On insère avec insertMany car le password est déjà hashé ci-dessus
  const created = await User.insertMany(users, { ordered: false });

  console.log(`✅ ${created.length} comptes créés :\n`);
  created.forEach(u => {
    console.log(`   [${u.role.padEnd(16)}] ${u.email}`);
  });

  console.log('\n🔑 Mot de passe pour tous : Pass@123\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erreur seeder :', err.message);
  process.exit(1);
});