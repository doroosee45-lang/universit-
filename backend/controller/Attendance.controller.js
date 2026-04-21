const Attendance = require('../models/Attendance.model');
const Course = require('../models/Course.model');
const Student = require('../models/Student.model');
const { success, created, notFound, paginated, badRequest } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const { sendAbsenceAlert } = require('../services/email.service');
const { generateAttendanceQR } = require('../services/qrcode.service');
const { sendNotification } = require('../services/notification.service');

// POST /api/attendance  - Prendre une présence
const takeAttendance = async (req, res, next) => {
  try {
    const { course, date, attendances } = req.body;
    // attendances = [{ student, status, checkInTime }]

    const results = [];
    for (const a of attendances) {
      const record = await Attendance.findOneAndUpdate(
        { student: a.student, course, date: new Date(date) },
        { student: a.student, course, date: new Date(date), teacher: req.user._id, status: a.status, checkInTime: a.checkInTime },
        { new: true, upsert: true }
      );
      results.push(record);

      // Vérifier seuil d'absences
      if (a.status === 'absent') {
        const absenceCount = await Attendance.countDocuments({
          student: a.student, course, status: { $in: ['absent'] }
        });
        if (absenceCount >= 3) {
          const student = await Student.findById(a.student);
          const courseData = await Course.findById(course).select('title');
          if (student) {
            await sendAbsenceAlert(student, courseData, absenceCount);
            await sendNotification({
              recipient: a.student,
              type: 'warning',
              title: 'Alerte absences',
              message: `Vous avez ${absenceCount} absences dans le cours ${courseData?.title}.`,
              link: '/etudiant/attendance'
            });
          }
        }
      }
    }

    return success(res, { count: results.length }, 'Présences enregistrées.');
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/course/:courseId  - Liste présences d'un cours
const getCourseAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    const filter = { course: req.params.courseId };
    if (date) filter.date = new Date(date);

    const records = await Attendance.find(filter)
      .populate('student', 'firstName lastName studentId')
      .sort({ 'student.lastName': 1 });

    return success(res, records);
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/student/:studentId  - Historique présences d'un étudiant
const getStudentAttendance = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const studentId = req.user.role === 'student' ? req.user._id : req.params.studentId;
    const filter = { student: studentId };
    if (req.query.course) filter.course = req.query.course;

    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate('course', 'title type')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(filter)
    ]);

    // Statistiques
    const stats = await Attendance.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return success(res, { records, stats, pagination: { total, page, limit } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/attendance/:id/justify  - Justifier une absence
const justifyAbsence = async (req, res, next) => {
  try {
    const { reason, proofUrl } = req.body;
    const record = await Attendance.findById(req.params.id);
    if (!record) return notFound(res, 'Enregistrement introuvable.');

    record.isJustified = true;
    record.justificationReason = reason;
    record.justificationProofUrl = proofUrl || req.file?.path;
    record.status = 'justified';
    await record.save();

    return success(res, record, 'Absence justifiée.');
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/course/:courseId/stats  - Stats présence par cours
const getCourseAttendanceStats = async (req, res, next) => {
  try {
    const stats = await Attendance.aggregate([
      { $match: { course: require('mongoose').Types.ObjectId(req.params.courseId) } },
      {
        $group: {
          _id: '$student',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          justified: { $sum: { $cond: [{ $eq: ['$status', 'justified'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
        }
      },
      {
        $addFields: {
          attendanceRate: { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
        }
      },
      { $sort: { attendanceRate: -1 } }
    ]);

    return success(res, stats);
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/qr/:courseId  - Générer QR Code émargement
const generateQRForCourse = async (req, res, next) => {
  try {
    const qr = await generateAttendanceQR(req.params.courseId, new Date(), req.user._id);
    return success(res, { qrCode: qr, expiresIn: '15 minutes' });
  } catch (err) {
    next(err);
  }
};

// POST /api/attendance/qr/scan  - Scanner QR Code (étudiant)
const scanQRAttendance = async (req, res, next) => {
  try {
    const { courseId, date, teacherId, expires } = req.body;
    if (new Date(expires) < new Date()) return badRequest(res, 'QR Code expiré.');

    const existing = await Attendance.findOne({
      student: req.user._id, course: courseId, date: new Date(date)
    });
    if (existing) return badRequest(res, 'Présence déjà enregistrée.');

    await Attendance.create({
      student: req.user._id, course: courseId,
      teacher: teacherId, date: new Date(date),
      status: 'present', scannedViaQR: true, checkInTime: new Date()
    });

    return success(res, null, 'Présence enregistrée via QR Code.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  takeAttendance, getCourseAttendance, getStudentAttendance,
  justifyAbsence, getCourseAttendanceStats, generateQRForCourse, scanQRAttendance
};