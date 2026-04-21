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



