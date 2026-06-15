const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/Room.controller');
const { protect }    = require('../middleware/Auth.middleware');
const { authorize }  = require('../middleware/Role.middleware');

router.use(protect);

router.get('/',     ctrl.getAllRooms);
router.get('/:id',  ctrl.getRoomById);
router.post('/',    authorize('admin', 'super_admin', 'staff'), ctrl.createRoom);
router.put('/:id',  authorize('admin', 'super_admin', 'staff'), ctrl.updateRoom);
router.delete('/:id', authorize('admin', 'super_admin'), ctrl.deleteRoom);

module.exports = router;
