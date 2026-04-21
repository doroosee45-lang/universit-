const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Internship.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);

// Internships
router.get('/', ctrl.getAllInternships);
router.get('/:id', ctrl.getInternshipById);
router.post('/', authorize('admin', 'staff'), ctrl.createInternship);
router.put('/:id', authorize('admin', 'staff'), ctrl.updateInternship);
router.delete('/:id', authorize('admin'), ctrl.deleteInternship);

// Companies
router.get('/companies', ctrl.getAllCompanies);
router.post('/companies', authorize('admin', 'staff'), ctrl.createCompany);
router.put('/companies/:id', authorize('admin', 'staff'), ctrl.updateCompany);
router.delete('/companies/:id', authorize('admin'), ctrl.deleteCompany);

module.exports = router;





// // backend/routes/internshipRoutes.js
// const express = require('express');
// const router = express.Router();

// // ✅ PLACER LES ROUTES SPÉCIFIQUES AVANT LES ROUTES AVEC PARAMÈTRES

// // Routes spécifiques
// router.get('/companies', internshipController.getCompanies);  // ✅ AVANT /:id
// router.get('/stats', internshipController.getStats);          // ✅ AVANT /:id

// // Routes avec paramètres
// router.get('/', internshipController.getAll);
// router.get('/:id', internshipController.getById);
// router.post('/', internshipController.create);
// router.put('/:id', internshipController.update);
// router.delete('/:id', internshipController.delete);

// module.exports = router;