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