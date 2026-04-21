// Report.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Report.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);

// Routes existantes
router.get('/stats', ctrl.getGlobalStats);
router.get('/transcript/:studentId', ctrl.getStudentTranscript);
router.get('/transcript/:studentId/pdf', ctrl.exportTranscriptPDF);
router.get('/attendance', authorize('admin', 'staff', 'teacher'), ctrl.getAttendanceReport);
router.get('/financial', authorize('admin', 'staff'), ctrl.getFinancialReport);
router.get('/students/export', authorize('admin', 'staff'), ctrl.exportStudentsExcel);

// ✅ AJOUTER CES ROUTES MANQUANTES
router.get('/quarterly', authorize('admin', 'staff'), ctrl.getQuarterlyReport);
router.get('/semester', authorize('admin', 'staff'), ctrl.getSemesterReport);
router.get('/annual', authorize('admin', 'staff'), ctrl.getAnnualReport);
router.post('/export', authorize('admin', 'staff'), ctrl.exportReport);

module.exports = router;