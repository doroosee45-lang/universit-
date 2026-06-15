const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Exam.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);

// ✅ Routes statiques EN PREMIER (avant /:id)
router.get( '/teacher/me',       authorize('admin', 'teacher', 'super_admin'), ctrl.getTeacherExams);
router.post('/publish-schedule', authorize('admin', 'super_admin'),            ctrl.publishSchedule);

// Routes générales
router.get('/',    ctrl.getAllExams);
router.post('/',   authorize('admin', 'staff', 'super_admin'), ctrl.createExam);

// ✅ Routes avec :id EN DERNIER
router.get('/:id',           ctrl.getExamById);
router.get('/:id/results',   ctrl.getExamResults);
router.put('/:id',           authorize('admin', 'staff', 'super_admin'), ctrl.updateExam);
router.delete('/:id',        authorize('admin', 'super_admin'), ctrl.deleteExam);
router.post('/:id/publish',  authorize('admin', 'teacher', 'super_admin'), ctrl.publishResults);

module.exports = router;