const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Exam.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);

router.get('/', ctrl.getAllExams);
router.get('/:id', ctrl.getExamById);
router.get('/:id/results', ctrl.getExamResults);
router.post('/', authorize('admin', 'staff'), ctrl.createExam);
router.put('/:id', authorize('admin', 'staff'), ctrl.updateExam);
router.delete('/:id', authorize('admin'), ctrl.deleteExam);
router.post('/:id/publish', authorize('admin', 'teacher'), ctrl.publishResults);

module.exports = router;
