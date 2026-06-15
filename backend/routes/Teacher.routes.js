const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Teacher.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');
const { uploadProfile } = require('../middleware/Upload.middleware');

const ADMINS   = ['super_admin', 'admin'];
const MANAGERS = ['super_admin', 'admin', 'staff'];

router.use(protect);

// Routes spéciales avant /:id
router.post('/me/photo', authorize('teacher'), uploadProfile, ctrl.uploadTeacherPhoto);

// CRUD
router.get('/',    ctrl.getAllTeachers);
router.get('/:id', ctrl.getTeacherById);
router.post('/',   authorize(...ADMINS),   ctrl.createTeacher);
router.put('/:id', authorize(...MANAGERS), ctrl.updateTeacher);
router.delete('/:id', authorize(...ADMINS), ctrl.deleteTeacher);

// Upload photo par admin/staff
router.post('/:id/photo', authorize(...MANAGERS), uploadProfile, ctrl.uploadTeacherPhoto);

module.exports = router;