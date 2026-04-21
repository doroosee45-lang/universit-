// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth.middleware');  // ✅ à ajouter

const {
  getOverallStats,
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
  getStaffDashboard,
  getDepartmentHeadDashboard,
  getUserDashboard
} = require('../controller/Dashboard.controller');

// 🔐 Appliquer l'authentification à toutes les routes du dashboard
router.use(protect);


router.get('/stats', getOverallStats);
router.get('/admin', getAdminDashboard);
router.get('/teacher', getTeacherDashboard);
router.get('/student', getStudentDashboard);
router.get('/staff', getStaffDashboard);
router.get('/department-head', getDepartmentHeadDashboard);
router.get('/me', getUserDashboard);

module.exports = router;