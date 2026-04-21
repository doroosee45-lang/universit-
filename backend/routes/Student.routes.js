const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Student.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');
const { uploadExcel, uploadProfile } = require('../middleware/Upload.middleware');

router.use(protect);

router.get('/', authorize('admin', 'staff', 'teacher'), ctrl.getAllStudents);
router.get('/me/profile', ctrl.getMyProfile);
router.get('/export/excel', authorize('admin', 'staff'), ctrl.exportStudents);
router.post('/import/excel', authorize('admin', 'staff'), uploadExcel, ctrl.importStudents);
router.get('/:id', ctrl.getStudentById);
router.post('/', authorize('admin', 'staff'), ctrl.createStudent);
router.put('/:id', authorize('admin', 'staff'), ctrl.updateStudent);
router.delete('/:id', authorize('admin'), ctrl.deleteStudent);

module.exports = router;


