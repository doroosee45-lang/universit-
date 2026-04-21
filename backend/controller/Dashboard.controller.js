// // controller/Dashboard.controller.js

// // ==================== DASHBOARD ADMIN ====================
// const getAdminDashboard = async (req, res) => {
//   try {
//     res.status(200).json({
//       success: true,
//       role: "admin",
//       message: "Bienvenue sur le Dashboard Administrateur",
//       data: {
//         totalStudents: 1243,
//         totalTeachers: 87,
//         totalCourses: 156,
//         pendingPayments: 23,
//         activePrograms: 12
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== DASHBOARD ENSEIGNANT ====================
// const getTeacherDashboard = async (req, res) => {
//   try {
//     res.status(200).json({
//       success: true,
//       role: "teacher",
//       message: "Bienvenue sur le Dashboard Enseignant",
//       data: {
//         myCourses: 5,
//         totalStudents: 142,
//         upcomingClasses: 8,
//         averageAttendance: "89%"
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== DASHBOARD ÉTUDIANT ====================
// const getStudentDashboard = async (req, res) => {
//   try {
//     res.status(200).json({
//       success: true,
//       role: "student",
//       message: "Bienvenue sur le Dashboard Étudiant",
//       data: {
//         currentSemester: "S2",
//         averageGrade: 14.5,
//         coursesEnrolled: 6,
//         attendanceRate: "92%",
//         nextExamDate: "2026-05-15"
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== DASHBOARD STAFF ====================
// const getStaffDashboard = async (req, res) => {
//   try {
//     res.status(200).json({
//       success: true,
//       role: "staff",
//       message: "Bienvenue sur le Dashboard Staff",
//       data: {
//         totalRegistrationsToday: 12,
//         pendingVerifications: 8,
//         recentActivities: 45
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== DASHBOARD CHEF DE DÉPARTEMENT ====================
// const getDepartmentHeadDashboard = async (req, res) => {
//   try {
//     res.status(200).json({
//       success: true,
//       role: "department_head",
//       message: "Bienvenue sur le Dashboard Chef de Département",
//       data: {
//         departmentStudents: 320,
//         departmentTeachers: 24,
//         coursesInDepartment: 48,
//         averagePerformance: "13.8/20"
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== STATISTIQUES GLOBALES ====================
// const getOverallStats = async (req, res) => {
//   try {
//     res.status(200).json({
//       success: true,
//       message: "Statistiques globales du système",
//       data: {
//         totalUsers: 1450,
//         totalStudents: 1243,
//         totalTeachers: 87,
//         totalPrograms: 12,
//         totalCourses: 156
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== DASHBOARD DYNAMIQUE SELON LE RÔLE ====================
// const getUserDashboard = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: "Utilisateur non authentifié" });
//     }

//     const role = req.user.role;

//     switch (role) {
//       case 'admin':
//         return getAdminDashboard(req, res);
//       case 'teacher':
//         return getTeacherDashboard(req, res);
//       case 'student':
//         return getStudentDashboard(req, res);
//       case 'staff':
//         return getStaffDashboard(req, res);
//       case 'department_head':
//         return getDepartmentHeadDashboard(req, res);
//       default:
//         return res.status(200).json({
//           success: true,
//           message: `Dashboard pour le rôle : ${role}`,
//           role: role
//         });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== EXPORT ====================
// module.exports = {
//   getAdminDashboard,
//   getTeacherDashboard,
//   getStudentDashboard,
//   getStaffDashboard,
//   getDepartmentHeadDashboard,
//   getOverallStats,
//   getUserDashboard
// };




// controller/Dashboard.controller.js
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const Enrollment = require('../models/Enrollment.model');
const Grade = require('../models/Grade.model');
const Attendance = require('../models/Attendance.model');
const Deliberation = require('../models/Deliberation');  // ✅ import du modèle délibération

// ---------- Helper : stats de délibération pour une année donnée ----------
const getDeliberationStats = async (academicYear) => {
  const filter = academicYear ? { academicYear } : {};
  const totalEligible = await User.countDocuments({ role: 'student', generalAverage: { $gte: 10 } });
  const deliberated = await Deliberation.countDocuments({ ...filter, validated: true });
  const certified = await Deliberation.countDocuments({ ...filter, certificateGenerated: true });
  return { eligible: totalEligible, deliberated, certified, pending: totalEligible - deliberated };
};

// ---------- 1. Statistiques globales (utilisées par le super admin) ----------
exports.getOverallStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const avgAttendance = await Attendance.aggregate([
      { $group: { _id: null, avg: { $avg: '$percentage' } } }
    ]);
    const avgGrade = await Grade.aggregate([
      { $group: { _id: null, avg: { $avg: '$finalAverage' } } }
    ]);

    const deliberationStats = await getDeliberationStats(academicYear);

    res.json({
      success: true,
      data: {
        users: { students: totalStudents, teachers: totalTeachers, staff: totalStaff },
        courses: totalCourses,
        enrollments: totalEnrollments,
        attendance: { average: avgAttendance[0]?.avg || 0 },
        grades: { average: avgGrade[0]?.avg || 0 },
        deliberation: deliberationStats
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- 2. Tableau de bord ADMIN ----------
exports.getAdminDashboard = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const totalCourses = await Course.countDocuments();
    const pendingGrades = await Grade.countDocuments({ status: 'pending' });
    const recentEnrollments = await Enrollment.find().sort({ createdAt: -1 }).limit(5).populate('student course');

    const deliberationStats = await getDeliberationStats(academicYear);

    res.json({
      success: true,
      data: {
        students: totalStudents,
        teachers: totalTeachers,
        staff: totalStaff,
        courses: totalCourses,
        pendingGrades,
        recentEnrollments,
        deliberation: deliberationStats
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- 3. Tableau de bord ENSEIGNANT ----------
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const myCourses = await Course.find({ teacher: teacherId }).populate('ue');
    const courseIds = myCourses.map(c => c._id);

    const pendingGrades = await Grade.countDocuments({ course: { $in: courseIds }, status: 'pending' });
    const recentAbsences = await Attendance.find({ course: { $in: courseIds }, status: 'absent' })
      .sort({ date: -1 }).limit(5).populate('student');

    res.json({
      success: true,
      data: {
        totalCourses: myCourses.length,
        pendingGrades,
        recentAbsences,
        myCourses
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- 4. Tableau de bord ÉTUDIANT ----------
exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const enrollments = await Enrollment.find({ student: studentId }).populate('course');
    const grades = await Grade.find({ student: studentId }).populate('course');
    const attendances = await Attendance.find({ student: studentId }).sort({ date: -1 }).limit(5);
    const deliberation = await Deliberation.findOne({ student: studentId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        enrollments: enrollments.length,
        averageGrade: grades.reduce((acc, g) => acc + (g.finalAverage || 0), 0) / (grades.length || 1),
        recentAttendances: attendances,
        deliberation: deliberation ? {
          validated: deliberation.validated,
          certificateGenerated: deliberation.certificateGenerated,
          mention: deliberation.mention,
          certificateNumber: deliberation.certificateNumber
        } : null
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- 5. Tableau de bord STAFF ----------
exports.getStaffDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalEnrollments = await Enrollment.countDocuments();
    const pendingFees = await Enrollment.countDocuments({ feeStatus: 'pending' });
    const recentLibraryLoans = []; // à adapter selon ton modèle bibliothèque

    res.json({
      success: true,
      data: {
        students: totalStudents,
        enrollments: totalEnrollments,
        pendingFees,
        recentLibraryLoans
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- 6. Tableau de bord CHEF DE DEPARTEMENT ----------
exports.getDepartmentHeadDashboard = async (req, res) => {
  try {
    const departmentId = req.user.department;
    const courses = await Course.find({ department: departmentId }).populate('teacher');
    const students = await User.find({ role: 'student', department: departmentId });
    const stats = {
      totalCourses: courses.length,
      totalStudents: students.length,
      averageClassSize: Math.round(students.length / (courses.length || 1))
    };
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- 7. Dashboard personnel (basé sur le rôle de l'utilisateur) ----------
exports.getUserDashboard = async (req, res) => {
  const role = req.user.role;
  switch (role) {
    case 'admin':
    case 'super_admin':
      return exports.getAdminDashboard(req, res);
    case 'teacher':
      return exports.getTeacherDashboard(req, res);
    case 'student':
      return exports.getStudentDashboard(req, res);
    case 'staff':
      return exports.getStaffDashboard(req, res);
    case 'department_head':
      return exports.getDepartmentHeadDashboard(req, res);
    default:
      return res.status(400).json({ message: 'Rôle non supporté' });
  }
};