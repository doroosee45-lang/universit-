const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Attendance.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);

router.get('/course/:courseId', ctrl.getCourseAttendance);
router.get('/course/:courseId/stats', ctrl.getCourseAttendanceStats);
router.get('/student/:studentId', ctrl.getStudentAttendance);
router.post('/', authorize('admin', 'teacher'), ctrl.takeAttendance);
router.put('/:id/justify', ctrl.justifyAbsence);
router.get('/qr/:courseId', authorize('admin', 'teacher'), ctrl.generateQRForCourse);
router.post('/qr/scan', ctrl.scanQRAttendance);

module.exports = router;