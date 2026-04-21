// scripts/seedSuperAdmin.js
// Exécuter une seule fois : node scripts/seedSuperAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const { generateMatricule } = require('../utils/helpers');

const SUPER_ADMIN = {
  firstName: 'Super',
  lastName:  'Admin',
  email:     process.env.SUPER_ADMIN_EMAIL || 'superadmin@uni.dz',
  password:  process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2024',
  role:      'super_admin',
  isEmailVerified: true,
  isActive:  true,
  mustChangePassword: false,  // Le super admin initial n'a pas besoin de changer
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si un super admin existe déjà
    const existing = await User.findOne({ role: 'super_admin' });
    if (existing) {
      console.log('⚠️  Un super admin existe déjà :', existing.email);
      process.exit(0);
    }

    const matricule = generateMatricule('super_admin');
    const superAdmin = await User.SuperAdmin.create({
      ...SUPER_ADMIN,
      matricule,
      superAdminLevel: 1,
      systemAccess: ['all']
    });

    console.log('🎉 Super Admin créé avec succès !');
    console.log('   Email     :', superAdmin.email);
    console.log('   Matricule :', superAdmin.matricule);
    console.log('   Mot de passe : (celui défini dans .env ou SuperAdmin@2024)');
    console.log('\n⚠️  Changez le mot de passe après la première connexion !');

  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();