const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Grade.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);

router.get('/', ctrl.getGrades);
router.post('/', authorize('admin', 'teacher'), ctrl.upsertGrade);
router.post('/bulk', authorize('admin', 'teacher'), ctrl.bulkUpsertGrades);
router.post('/publish', authorize('admin', 'teacher'), ctrl.publishGrades);
router.get('/student/:studentId/transcript', ctrl.getStudentTranscript);
router.get('/student/:studentId/transcript/pdf', ctrl.downloadTranscriptPDF);
router.get('/ue/:ueId/export', authorize('admin', 'teacher'), ctrl.exportUEGradesExcel);
router.put('/:id/session2', authorize('admin', 'teacher'), ctrl.addSession2Grade);

module.exports = router;