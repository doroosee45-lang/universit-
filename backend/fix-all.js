// fix-all.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User.model');

const fixAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university_db');
    console.log("✅ Connecté à MongoDB\n");

    // 1. Réinitialiser TOUS les mots de passe
    const defaultPassword = await bcrypt.hash('password123', 12);
    const adminPassword = await bcrypt.hash('Meya13122000', 12);
    
    // Mettre à jour admin
    await User.updateOne(
      { email: "oseedoro@gmail.com" },
      { 
        $set: { 
          password: adminPassword, 
          loginAttempts: 0, 
          lockUntil: null, 
          isActive: true,
          isEmailVerified: true 
        } 
      }
    );
    
    // Mettre à jour tous les autres
    await User.updateMany(
      { email: { $ne: "oseedoro@gmail.com" } },
      { 
        $set: { 
          password: defaultPassword, 
          loginAttempts: 0, 
          lockUntil: null, 
          isActive: true,
          isEmailVerified: true 
        } 
      }
    );
    
    console.log("✅ Tous les mots de passe ont été réinitialisés !\n");
    
    // 2. Afficher les comptes disponibles
    const users = await User.find({}, { email: 1, firstName: 1, lastName: 1, role: 1 });
    
    console.log("📋 COMPTES DISPONIBLES :\n");
    console.log("🔑 ADMIN :");
    console.log("   Email: oseedoro@gmail.com");
    console.log("   Mot de passe: Meya13122000\n");
    
    console.log("👥 AUTRES COMPTES :");
    users.forEach(user => {
      if (user.email !== "oseedoro@gmail.com") {
        console.log(`   ${user.email} (${user.role}) → password123`);
      }
    });
    
    console.log("\n✅ Prêt ! Vous pouvez maintenant vous connecter.");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
};

fixAll();