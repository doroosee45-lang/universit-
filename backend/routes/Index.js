

const express = require('express');
const router = express.Router();

const authRoutes         = require('./Auth.routes');
const studentRoutes      = require('./Student.routes');
const teacherRoutes      = require('./Teacher.routes');
const gradeRoutes        = require('./Grade.routes');
const attendanceRoutes   = require('./Attendance.routes');
const feeRoutes          = require('./Fee.routes');
const programRoutes      = require('./Program.routes');
const ueRoutes           = require('./Ue.routes');
const courseRoutes       = require('./Course.routes');
const scheduleRoutes     = require('./Schedule.routes');
const examRoutes         = require('./Exam.routes');
const libraryRoutes      = require('./Library.routes');
const internshipRoutes   = require('./Internship.routes');
const reportRoutes       = require('./Report.routes');
const dashboardRoutes    = require('./dashboardRoutes');
const deliberationRoutes = require('./deliberationRoutes');
const staffRoutes        = require('./staffRoutes');
const assignmentRoutes   = require('./assignmentRoutes');

// Misc.routes exporte { settingsRouter, notifRouter } — on destructure
const { settingsRouter, notifRouter } = require('./Misc.routes');

// ─── Health check ─────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
router.use('/auth',           authRoutes);
router.use('/students',       studentRoutes);
router.use('/teachers',       teacherRoutes);
router.use('/grades',         gradeRoutes);
router.use('/attendance',     attendanceRoutes);
router.use('/fees',           feeRoutes);
router.use('/programs',       programRoutes);
router.use('/ues',            ueRoutes);
router.use('/courses',        courseRoutes);
router.use('/schedules',      scheduleRoutes);
router.use('/exams',          examRoutes);
router.use('/library',        libraryRoutes);
router.use('/internships',    internshipRoutes);
router.use('/reports',        reportRoutes);
router.use('/settings',       settingsRouter);   // ✅ une seule fois, depuis Misc.routes
router.use('/notifications',  notifRouter);
router.use('/dashboard',      dashboardRoutes);
router.use('/deliberations',  deliberationRoutes);
router.use('/staff',          staffRoutes);
router.use('/assignments',    assignmentRoutes);

module.exports = router;