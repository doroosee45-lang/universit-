const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Schedule.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);

router.get('/', ctrl.getAllSchedules);
router.get('/:id', ctrl.getScheduleById);
router.get('/teacher/:teacherId', ctrl.getTeacherSchedule);
router.post('/', authorize('admin', 'staff'), ctrl.createSchedule);
router.put('/:id', authorize('admin', 'staff'), ctrl.updateSchedule);
router.delete('/:id', authorize('admin', 'staff'), ctrl.deleteSchedule);

module.exports = router;




























// const express = require('express');
// const router = express.Router();
// const { protect, authorize } = require('../middleware/auth');
// const scheduleController = require('../controllers/scheduleController');

// // Routes accessibles à tous les utilisateurs authentifiés (mais filtrées par rôle)
// router.get('/', protect, scheduleController.getAll); // admin peut tout voir, autres filtré? à adapter
// router.get('/teacher', protect, scheduleController.getTeacherSchedule);
// router.get('/student', protect, scheduleController.getStudentSchedule);

// // Routes admin seulement
// router.post('/', protect, authorize('admin', 'super_admin'), scheduleController.create);
// router.put('/:id', protect, authorize('admin', 'super_admin'), scheduleController.update);
// router.delete('/:id', protect, authorize('admin', 'super_admin'), scheduleController.delete);

// module.exports = router;