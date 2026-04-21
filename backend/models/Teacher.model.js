const mongoose = require('mongoose');
const User = require('./User.model');

const TeacherSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  department: { type: String, required: true },
  title: {
    type: String,
    enum: ['Professeur', 'Maître de Conférences A', 'Maître de Conférences B',
      'Maître Assistant A', 'Maître Assistant B', 'Attaché d\'enseignement', 'Vacataire'],
    default: 'Maître Assistant A'
  },
  specialties: [String],
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  // UEs dont il est responsable
  responsibleUEs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UE' }],
  // Informations professionnelles
  hireDate: Date,
  contractType: {
    type: String,
    enum: ['permanent', 'contractuel', 'vacataire'],
    default: 'permanent'
  },
  office: String,
  bio: String,
  // Disponibilités
  availabilities: [{
    dayOfWeek: { type: Number, min: 0, max: 6 },
    startTime: String,
    endTime: String
  }]
});

TeacherSchema.index({ employeeId: 1 });
TeacherSchema.index({ department: 1 });

const Teacher = User.discriminator('teacher', TeacherSchema);
module.exports = Teacher;