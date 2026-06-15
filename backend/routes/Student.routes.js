const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controller/Student.controller');
const { protect }   = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');
const { uploadProfile, uploadExcel } = require('../middleware/Upload.middleware');

const ADMINS   = ['super_admin', 'admin'];
const MANAGERS = ['super_admin', 'admin', 'staff', 'department_head'];
const VIEWERS  = ['super_admin', 'admin', 'staff', 'teacher', 'department_head'];

router.use(protect);

// ── Routes spéciales (avant /:id) ────────────────────────────────────────────
router.get('/me/profile',    authorize('student'),  ctrl.getMyProfile);
router.get('/export/excel',  authorize(...ADMINS),  ctrl.exportStudents);
router.post('/import/excel', authorize(...ADMINS),  uploadExcel, ctrl.importStudents);

// ── Upload photo de profil ────────────────────────────────────────────────────
router.post('/:id/photo',    authorize(...MANAGERS), uploadProfile, ctrl.uploadStudentPhoto);

// ── CRUD ─────────────────────────────────────────────────────────────────────
router.get('/',    authorize(...VIEWERS), ctrl.getAllStudents);
router.get('/:id', authorize(...VIEWERS), ctrl.getStudentById);
router.post('/',   authorize(...ADMINS),  ctrl.createStudent);
router.put('/:id', authorize(...ADMINS),  ctrl.updateStudent);
router.delete('/:id', authorize(...ADMINS), ctrl.deleteStudent);

module.exports = router;
