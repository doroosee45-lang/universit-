const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Internship.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);

// ✅ ROUTES STATIQUES EN PREMIER (avant toute route avec :id)

// Companies — DOIT être avant /:id sinon Express interprète "companies" comme un :id
router.get('/companies', ctrl.getAllCompanies);
router.post('/companies', authorize('admin', 'staff'), ctrl.createCompany);
router.put('/companies/:id', authorize('admin', 'staff'), ctrl.updateCompany);
router.delete('/companies/:id', authorize('admin'), ctrl.deleteCompany);

// Internships — routes générales
router.get('/', ctrl.getAllInternships);
router.post('/', authorize('admin', 'staff'), ctrl.createInternship);

// ✅ Routes avec :id EN DERNIER
router.get('/:id', ctrl.getInternshipById);
router.put('/:id', authorize('admin', 'staff'), ctrl.updateInternship);
router.delete('/:id', authorize('admin'), ctrl.deleteInternship);

module.exports = router;