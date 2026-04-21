const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getJuryMembers, updateJuryMembers, inviteJuryMembers } = require('../controllers/juryController');

router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', getJuryMembers);
router.put('/', updateJuryMembers);
router.post('/invite', inviteJuryMembers);

module.exports = router;