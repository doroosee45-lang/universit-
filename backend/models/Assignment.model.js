const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  ue: { type: mongoose.Schema.Types.ObjectId, ref: 'UE', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  academicYear: { type: String, required: true },
  groups: [String], // groupes concernés
  dueDate: { type: Date, required: true },
  maxScore: { type: Number, default: 20 },
  type: {
    type: String,
    enum: ['devoir_maison', 'tp', 'projet', 'expose', 'rapport', 'autre'],
    default: 'devoir_maison'
  },
  isGroupWork: { type: Boolean, default: false },
  attachments: [{ name: String, url: String }],
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  weight: { type: Number, default: 0 } // % dans la note de CC
}, { timestamps: true });

AssignmentSchema.index({ course: 1 });
AssignmentSchema.index({ teacher: 1 });
AssignmentSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);