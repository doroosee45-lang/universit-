const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../config/constants');

const AttendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: Object.values(ATTENDANCE_STATUS),
    default: ATTENDANCE_STATUS.ABSENT
  },
  checkInTime: Date,
  // Justificatif
  isJustified: { type: Boolean, default: false },
  justificationReason: String,
  justificationProofUrl: String,
  justificationApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  justificationApprovedAt: Date,
  // QR Code
  scannedViaQR: { type: Boolean, default: false },
  notes: String
}, { timestamps: true });

// Un étudiant ne peut avoir qu'une présence par cours par date
AttendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ course: 1, date: 1 });
AttendanceSchema.index({ student: 1, date: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);


// // backend/controllers/attendanceController.js
// const mongoose = require('mongoose');

// exports.getCourseStats = async (req, res) => {
//   try {
//     const { courseId } = req.params;
    
//     // ✅ CORRECTION : Utiliser 'new' avec ObjectId
//     const objectId = new mongoose.Types.ObjectId(courseId);
    
//     const stats = await Attendance.aggregate([
//       { $match: { course: objectId } },
//       // ... reste de l'agrégation
//     ]);
    
//     res.json({ success: true, data: stats });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };