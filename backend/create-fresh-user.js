// create-fresh-user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User.model');

const createFreshUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university_db');
    console.log("✅ Connecté\n");

    // Supprimer complètement tous les anciens comptes
    await User.deleteMany({});
    console.log("✅ Tous les anciens comptes supprimés\n");

    // Créer un NOUVEAU compte admin SIMPLE
    const hashedPass = await bcrypt.hash('admin123', 10);
    
    const newUser = await User.create({
      firstName: "Admin",
      lastName: "Principal",
      email: "admin@school.com",
      password: hashedPass,
      role: "admin",
      isActive: true,
      isEmailVerified: true,
      loginAttempts: 0
    });

    console.log("🎉 NOUVEAU COMPTE CRÉÉ !");
    console.log("━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email : admin@school.com");
    console.log("🔑 Mot de passe : admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("👉 Utilisez ces identifiants pour vous connecter");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
};

createFreshUser();