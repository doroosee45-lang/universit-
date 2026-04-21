const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Course.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);
router.get('/', ctrl.getAllCourses);
router.get('/:id', ctrl.getCourseById);
router.post('/', authorize('admin'), ctrl.createCourse);
router.put('/:id', authorize('admin'), ctrl.updateCourse);
router.delete('/:id', authorize('admin'), ctrl.deleteCourse);

module.exports = router;

