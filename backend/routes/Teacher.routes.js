const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Teacher.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');
const { uploadProfile } = require('../middleware/Upload.middleware');

router.use(protect);
router.get('/', ctrl.getAllTeachers);
router.get('/:id', ctrl.getTeacherById);
router.post('/', authorize('admin'), ctrl.createTeacher);
router.put('/:id', authorize('admin', 'staff'), ctrl.updateTeacher);
router.delete('/:id', authorize('admin'), ctrl.deleteTeacher);

module.exports = router;