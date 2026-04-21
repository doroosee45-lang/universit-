const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/Fee.controller');
const { protect }   = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);

// ── Stats & reminders (admin/staff only) — AVANT /:id pour éviter les conflits
router.get('/stats',        authorize('admin', 'staff'),          ctrl.getFinancialStats);
router.post('/reminders',   authorize('admin', 'staff'),          ctrl.sendReminders);

// ── CRUD principal
// ✅ students peuvent lire leurs propres frais (le controller filtre par req.user._id)
router.get('/',             protect,                               ctrl.getFees);
router.post('/',            authorize('admin', 'staff'),          ctrl.createFee);

// ── Actions sur une fiche
// ✅ students peuvent payer leurs propres frais
router.post('/:id/pay',     protect,                               ctrl.recordPayment);
router.get('/:id/history',  protect,                               ctrl.getPaymentHistory);
router.get('/:id/receipt/:paymentId/pdf', protect,                ctrl.downloadReceipt);

// ── Changement de statut (admin/staff uniquement)
router.patch('/:id/status', authorize('admin', 'staff'),          ctrl.updateFeeStatus);

// ── Suppression (admin uniquement)
router.delete('/:id',       authorize('admin'),                    ctrl.deleteFee);

module.exports = router;