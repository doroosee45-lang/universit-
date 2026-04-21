const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Ue.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);

router.get('/', ctrl.getAllUEs);
router.get('/:id', ctrl.getUEById);
router.get('/:id/courses', ctrl.getUECourses);
router.post('/', authorize('admin'), ctrl.createUE);
router.put('/:id', authorize('admin'), ctrl.updateUE);
router.delete('/:id', authorize('admin'), ctrl.deleteUE);

module.exports = router;
