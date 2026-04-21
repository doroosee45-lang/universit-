const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Program.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);

router.get('/', ctrl.getAllPrograms);
router.get('/:id', ctrl.getProgramById);
router.get('/:id/ues', ctrl.getProgramUEs);
router.post('/', authorize('admin'), ctrl.createProgram);
router.put('/:id', authorize('admin'), ctrl.updateProgram);
router.delete('/:id', authorize('admin'), ctrl.deleteProgram);

module.exports = router;
