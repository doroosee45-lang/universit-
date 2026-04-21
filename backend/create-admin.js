const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Modèle User
const User = require('./models/User.model');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@omedev.com' });
    
    if (existingAdmin) {
      console.log('⚠️ Un admin existe déjà :', existingAdmin.email);
      
      // Mettre à jour le mot de passe si nécessaire
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      existingAdmin.password = hashedPassword;
      existingAdmin.isActive = true;
      existingAdmin.isEmailVerified = true;
      await existingAdmin.save();
      
      console.log('✅ Mot de passe admin réinitialisé');
    } else {
      // Créer un nouvel admin
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      
      const admin = await User.create({
        firstName: 'meya',
        lastName: 'osee',
        email: 'meya@gmail.com',
        password: '123456',
        phone: '+21655550359',
        dateOfBirth: new Date('1980-01-01'),
        gender: 'male',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        isVerified: true
      });
      
      console.log('✅ Admin créé avec succès !');
      console.log('   Email: admin@omedev.com');
      console.log('   Mot de passe: Admin123!');
    }
    
    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createAdmin();