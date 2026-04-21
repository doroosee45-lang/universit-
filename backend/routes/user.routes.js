// routes/user.routes.js

const express = require('express');
const router = express.Router();

const { protect, authorize, superAdminOnly } = require('../middleware/authMiddleware');
const { 
  createAdmin, 
  createTeacher, 
  createStaff,
  getUsers,
  // ... autres controllers
} = require('../controllers/userController');

// ==================== ROUTES RÉSERVÉES AU SUPER ADMIN ====================
router.post('/admins', protect, superAdminOnly, createAdmin);           // Créer un Admin

// ==================== ROUTES ACCESSIBLES À ADMIN + SUPER ADMIN ====================
router.post('/teachers', protect, authorize('admin'), createTeacher);   // Créer un Enseignant
router.post('/staff', protect, authorize('admin'), createStaff);        // Créer un Staff

router.get('/', protect, authorize('admin'), getUsers);                 // Lister tous les utilisateurs

// Tu peux ajouter d'autres routes ici (update, delete, etc.)

module.exports = router;