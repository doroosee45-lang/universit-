const express = require('express');
const router = express.Router();
const deliberationController = require('../controller/deliberationController');
const { protect } = require('../middleware/Auth.middleware');

// Middleware d'authentification
router.use(protect);

// Middleware de vérification des rôles (admin ou super_admin)
const requireAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Accès non autorisé : réservé à l\'administration' });
  }
};

router.use(requireAdmin);

router.get('/eligible', deliberationController.getEligibleStudents);
router.post('/validate', deliberationController.validateDeliberation);
router.post('/certificate', deliberationController.generateCertificate);
router.get('/stats', deliberationController.getStats);

module.exports = router;