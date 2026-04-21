const express = require('express');
const router = express.Router();
const assignmentController = require('../controller/assignmentController');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');  // ✅ authorize vient de Role.middleware comme dans Student.routes.js
const { uploadAssignment } = require('../middleware/Upload.middleware'); // ✅ nom exact

// Routes Teacher
router.post('/',      protect, authorize('teacher', 'admin'), assignmentController.createAssignment);
router.put('/:id',   protect, authorize('teacher', 'admin'), assignmentController.updateAssignment);
router.delete('/:id',protect, authorize('teacher', 'admin'), assignmentController.deleteAssignment);
router.get('/',      protect, authorize('teacher', 'admin'), assignmentController.getTeacherAssignments);

// Route Student — devoirs de sa classe
router.get('/student', protect, authorize('student'), assignmentController.getStudentAssignments);

// Route Student — soumettre un devoir
router.post('/:id/submit', protect, authorize('student'), uploadAssignment, assignmentController.submitAssignment);

// Route Student — statut de soumission
router.get('/:id/submission/status', protect, authorize('student'), assignmentController.getSubmissionStatus);

// Route Teacher — voir les soumissions
router.get('/:id/submissions', protect, authorize('teacher', 'admin'), assignmentController.getAssignmentSubmissions);

module.exports = router;