// // controller/Dashboard.controller.js

// const User       = require('../models/User.model');
// const Course     = require('../models/Course.model');
// const Enrollment = require('../models/Enrollment.model');
// const Grade      = require('../models/Grade.model');
// const Attendance = require('../models/Attendance.model');
// const Deliberation = require('../models/Deliberation');
// const Fee        = require('../models/Fee.model');
// const Program    = require('../models/Program.model');

// // ─────────────────────────────────────────────────────────────
// // Helper : année académique courante  ex: "2024-2025"
// // ─────────────────────────────────────────────────────────────
// const currentAcademicYear = () => {
//   const y = new Date().getFullYear();
//   return `${y}-${y + 1}`;
// };

// // ─────────────────────────────────────────────────────────────
// // Helper : stats délibération
// // ─────────────────────────────────────────────────────────────
// const getDeliberationStats = async (academicYear) => {
//   const filter = academicYear ? { academicYear } : {};
//   const [deliberated, certified, total] = await Promise.all([
//     Deliberation.countDocuments({ ...filter, validated: true }),
//     Deliberation.countDocuments({ ...filter, certificateGenerated: true }),
//     Deliberation.countDocuments(filter),
//   ]);
//   return { total, deliberated, certified, pending: total - deliberated };
// };

// // ═════════════════════════════════════════════════════════════
// // 1. STATS GLOBALES  —  SuperAdmin
// // ═════════════════════════════════════════════════════════════
// exports.getOverallStats = async (req, res) => {
//   try {
//     const academicYear = currentAcademicYear();

//     const [
//       totalStudents,
//       totalTeachers,
//       totalStaff,
//       totalCourses,
//       totalPrograms,
//       totalEnrollments,
//       avgAttendanceResult,
//       avgGradeResult,
//       deliberationStats,
//     ] = await Promise.all([
//       User.countDocuments({ role: 'student' }),
//       User.countDocuments({ role: 'teacher' }),
//       User.countDocuments({ role: 'staff' }),
//       Course.countDocuments(),
//       Program.countDocuments({ isActive: true }),
//       Enrollment.countDocuments(),
//       // Attendance n'a pas de champ 'percentage' → on calcule le taux présent/total
//       Attendance.aggregate([
//         {
//           $group: {
//             _id: null,
//             total:   { $sum: 1 },
//             present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
//           },
//         },
//         { $project: { rate: { $multiply: [{ $divide: ['$present', '$total'] }, 100] } } },
//       ]),
//       Grade.aggregate([
//         { $match: { finalAverage: { $gt: 0 } } },
//         { $group: { _id: null, avg: { $avg: '$finalAverage' } } },
//       ]),
//       getDeliberationStats(academicYear),
//     ]);

//     res.json({
//       success: true,
//       data: {
//         users: {
//           students: totalStudents,
//           teachers: totalTeachers,
//           staff:    totalStaff,
//           total:    totalStudents + totalTeachers + totalStaff,
//         },
//         courses:     totalCourses,
//         programs:    totalPrograms,
//         enrollments: totalEnrollments,
//         attendance:  { rate: Math.round(avgAttendanceResult[0]?.rate || 0) },
//         grades:      { average: +(avgGradeResult[0]?.avg || 0).toFixed(2) },
//         deliberation: deliberationStats,
//       },
//     });
//   } catch (err) {
//     console.error('[getOverallStats]', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ═════════════════════════════════════════════════════════════
// // 2. DASHBOARD ADMIN  (+ super_admin redirigé ici via getUserDashboard)
// // ═════════════════════════════════════════════════════════════
// exports.getAdminDashboard = async (req, res) => {
//   try {
//     const academicYear = currentAcademicYear();

//     const [
//       totalStudents,
//       totalTeachers,
//       totalStaff,
//       totalCourses,
//       deliberationStats,
//       // ✅ FIX : Enrollment ne contient PAS de champ 'course' → on populate uniquement 'student' et 'ue'
//       recentEnrollments,
//       // Frais impayés
//       unpaidFees,
//     ] = await Promise.all([
//       User.countDocuments({ role: 'student' }),
//       User.countDocuments({ role: 'teacher' }),
//       User.countDocuments({ role: 'staff' }),
//       Course.countDocuments(),
//       getDeliberationStats(academicYear),
//       Enrollment.find()
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .populate('student', 'firstName lastName email')   // ✅ champs limités
//         .populate('ue',      'code title')                 // ✅ 'ue' existe dans Enrollment
//         .populate('program', 'name code')
//         .lean(),
//       Fee.countDocuments({ status: { $in: ['pending', 'partial'] } }),
//     ]);

//     // Notes en attente : Grade n'a pas de champ 'status' → on compte les non validées
//     const pendingGrades = await Grade.countDocuments({ isValidated: false });

//     res.json({
//       success: true,
//       data: {
//         students:          totalStudents,
//         teachers:          totalTeachers,
//         staff:             totalStaff,
//         courses:           totalCourses,
//         pendingGrades,
//         unpaidFees,
//         recentEnrollments,
//         deliberation:      deliberationStats,
//       },
//     });
//   } catch (err) {
//     console.error('[getAdminDashboard]', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ═════════════════════════════════════════════════════════════
// // 3. DASHBOARD ENSEIGNANT
// // ═════════════════════════════════════════════════════════════
// exports.getTeacherDashboard = async (req, res) => {
//   try {
//     const teacherId = req.user._id;

//     const myCourses = await Course.find({ teacher: teacherId })
//       .populate('ue', 'code title credits')
//       .lean();

//     const courseIds = myCourses.map((c) => c._id);

//     // Grade n'a pas de champ 'status' → notes non validées = isValidated: false
//     const [pendingGrades, recentAbsences, totalEnrolled] = await Promise.all([
//       Grade.countDocuments({ course: { $in: courseIds }, isValidated: false }),
//       Attendance.find({ course: { $in: courseIds }, status: 'absent' })
//         .sort({ date: -1 })
//         .limit(5)
//         .populate('student', 'firstName lastName studentId')
//         .populate('course',  'code title')
//         .lean(),
//       Enrollment.countDocuments({ ue: { $in: myCourses.map((c) => c.ue?._id).filter(Boolean) } }),
//     ]);

//     res.json({
//       success: true,
//       data: {
//         totalCourses:   myCourses.length,
//         totalEnrolled,
//         pendingGrades,
//         recentAbsences,
//         myCourses,
//       },
//     });
//   } catch (err) {
//     console.error('[getTeacherDashboard]', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ═════════════════════════════════════════════════════════════
// // 4. DASHBOARD ÉTUDIANT
// // ═════════════════════════════════════════════════════════════
// exports.getStudentDashboard = async (req, res) => {
//   try {
//     const studentId = req.user._id;

//     const [enrollments, grades, recentAttendances, deliberation] = await Promise.all([
//       Enrollment.find({ student: studentId })
//         .populate('ue',      'code title credits coefficient')
//         .populate('program', 'name code')
//         .lean(),
//       Grade.find({ student: studentId })
//         .populate('ue', 'code title credits')
//         .lean(),
//       Attendance.find({ student: studentId })
//         .sort({ date: -1 })
//         .limit(5)
//         .populate('course', 'code title')
//         .lean(),
//       Deliberation.findOne({ student: studentId }).sort({ createdAt: -1 }).lean(),
//     ]);

//     const validGrades = grades.filter((g) => g.finalAverage > 0);
//     const average =
//       validGrades.length > 0
//         ? +(validGrades.reduce((acc, g) => acc + g.finalAverage, 0) / validGrades.length).toFixed(2)
//         : 0;

//     // Taux de présence
//     const totalAtt   = await Attendance.countDocuments({ student: studentId });
//     const presentAtt = await Attendance.countDocuments({ student: studentId, status: 'present' });
//     const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

//     res.json({
//       success: true,
//       data: {
//         enrollments:      enrollments.length,
//         averageGrade:     average,
//         attendanceRate,
//         recentAttendances,
//         grades,
//         deliberation: deliberation
//           ? {
//               validated:            deliberation.validated,
//               certificateGenerated: deliberation.certificateGenerated,
//               mention:              deliberation.mention,
//               certificateNumber:    deliberation.certificateNumber,
//               session:              deliberation.session,
//               generalAverage:       deliberation.generalAverage,
//             }
//           : null,
//       },
//     });
//   } catch (err) {
//     console.error('[getStudentDashboard]', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ═════════════════════════════════════════════════════════════
// // 5. DASHBOARD STAFF
// // ═════════════════════════════════════════════════════════════
// exports.getStaffDashboard = async (req, res) => {
//   try {
//     const [totalStudents, totalEnrollments, unpaidFees, recentStudents] = await Promise.all([
//       User.countDocuments({ role: 'student' }),
//       Enrollment.countDocuments(),
//       Fee.countDocuments({ status: { $in: ['pending', 'partial'] } }),
//       User.find({ role: 'student' })
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .select('firstName lastName email studentId createdAt')
//         .lean(),
//     ]);

//     res.json({
//       success: true,
//       data: {
//         students:         totalStudents,
//         enrollments:      totalEnrollments,
//         unpaidFees,
//         recentStudents,
//       },
//     });
//   } catch (err) {
//     console.error('[getStaffDashboard]', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ═════════════════════════════════════════════════════════════
// // 6. DASHBOARD CHEF DE DÉPARTEMENT
// // ═════════════════════════════════════════════════════════════
// exports.getDepartmentHeadDashboard = async (req, res) => {
//   try {
//     // 'department' est une String sur le User (pas un ObjectId)
//     const department = req.user.department;

//     const [courses, teachers] = await Promise.all([
//       Course.find({ /* pas de champ 'department' dans Course → on cherche via program */ })
//         .populate({
//           path:   'program',
//           match:  { department },       // filtre sur le programme
//           select: 'name code department',
//         })
//         .populate('teacher', 'firstName lastName')
//         .lean(),
//       User.find({ role: 'teacher', department }).select('firstName lastName employeeId title').lean(),
//     ]);

//     // Cours dont le programme correspond au département
//     const deptCourses = courses.filter((c) => c.program !== null);

//     const ueIds = [...new Set(deptCourses.map((c) => c.ue?.toString()).filter(Boolean))];
//     const totalEnrolled = await Enrollment.countDocuments({ ue: { $in: ueIds } });

//     res.json({
//       success: true,
//       data: {
//         department,
//         totalCourses:       deptCourses.length,
//         totalTeachers:      teachers.length,
//         totalEnrolled,
//         averageClassSize:   deptCourses.length > 0 ? Math.round(totalEnrolled / deptCourses.length) : 0,
//         teachers,
//       },
//     });
//   } catch (err) {
//     console.error('[getDepartmentHeadDashboard]', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ═════════════════════════════════════════════════════════════
// // 7. DASHBOARD DYNAMIQUE selon le rôle connecté
// // ═════════════════════════════════════════════════════════════
// exports.getUserDashboard = async (req, res) => {
//   const role = req.user?.role;

//   switch (role) {
//     case 'super_admin':           // ✅ super_admin → même dashboard qu'admin
//     case 'admin':
//       return exports.getAdminDashboard(req, res);
//     case 'teacher':
//       return exports.getTeacherDashboard(req, res);
//     case 'student':
//       return exports.getStudentDashboard(req, res);
//     case 'staff':
//       return exports.getStaffDashboard(req, res);
//     case 'department_head':
//       return exports.getDepartmentHeadDashboard(req, res);
//     default:
//       return res.status(400).json({ success: false, message: `Rôle non supporté : ${role}` });
//   }
// };



// controller/Dashboard.controller.js

const User       = require('../models/User.model');
const Course     = require('../models/Course.model');
const Enrollment = require('../models/Enrollment.model');
const Grade      = require('../models/Grade.model');
const Attendance = require('../models/Attendance.model');
const Deliberation = require('../models/Deliberation');
const Fee        = require('../models/Fee.model');
const Program    = require('../models/Program.model');

// ─────────────────────────────────────────────────────────────
// Helper : année académique courante  ex: "2024-2025"
// ─────────────────────────────────────────────────────────────
const currentAcademicYear = () => {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
};

// ─────────────────────────────────────────────────────────────
// Helper : stats délibération
// ─────────────────────────────────────────────────────────────
const getDeliberationStats = async (academicYear) => {
  const filter = academicYear ? { academicYear } : {};
  const [deliberated, certified, total] = await Promise.all([
    Deliberation.countDocuments({ ...filter, validated: true }),
    Deliberation.countDocuments({ ...filter, certificateGenerated: true }),
    Deliberation.countDocuments(filter),
  ]);
  return { total, deliberated, certified, pending: total - deliberated };
};

// ═════════════════════════════════════════════════════════════
// 1. STATS GLOBALES  —  SuperAdmin
// ═════════════════════════════════════════════════════════════
exports.getOverallStats = async (req, res) => {
  try {
    const academicYear = currentAcademicYear();

    const [
      totalStudents,
      totalTeachers,
      totalStaff,
      totalCourses,
      totalPrograms,
      totalEnrollments,
      avgAttendanceResult,
      avgGradeResult,
      deliberationStats,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'staff' }),
      Course.countDocuments(),
      Program.countDocuments({ isActive: true }),
      Enrollment.countDocuments(),
      // Attendance n'a pas de champ 'percentage' → on calcule le taux présent/total
      Attendance.aggregate([
        {
          $group: {
            _id: null,
            total:   { $sum: 1 },
            present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          },
        },
        { $project: { rate: { $multiply: [{ $divide: ['$present', '$total'] }, 100] } } },
      ]),
      Grade.aggregate([
        { $match: { finalAverage: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$finalAverage' } } },
      ]),
      getDeliberationStats(academicYear),
    ]);

    res.json({
      success: true,
      data: {
        users: {
          students: totalStudents,
          teachers: totalTeachers,
          staff:    totalStaff,
          total:    totalStudents + totalTeachers + totalStaff,
        },
        courses:     totalCourses,
        programs:    totalPrograms,
        enrollments: totalEnrollments,
        attendance:  { rate: Math.round(avgAttendanceResult[0]?.rate || 0) },
        grades:      { average: +(avgGradeResult[0]?.avg || 0).toFixed(2) },
        deliberation: deliberationStats,
      },
    });
  } catch (err) {
    console.error('[getOverallStats]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═════════════════════════════════════════════════════════════
// 2. DASHBOARD ADMIN  (+ super_admin redirigé ici via getUserDashboard)
// ═════════════════════════════════════════════════════════════
exports.getAdminDashboard = async (req, res) => {
  try {
    const academicYear = currentAcademicYear();

    const [
      totalStudents,
      totalTeachers,
      totalStaff,
      totalCourses,
      deliberationStats,
      // ✅ FIX : Enrollment ne contient PAS de champ 'course' → on populate uniquement 'student' et 'ue'
      recentEnrollments,
      // Frais impayés
      unpaidFees,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'staff' }),
      Course.countDocuments(),
      getDeliberationStats(academicYear),
      Enrollment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('student', 'firstName lastName email')   // ✅ champs limités
        .populate('ue',      'code title')                 // ✅ 'ue' existe dans Enrollment
        .populate('program', 'name code')
        .lean(),
      Fee.countDocuments({ status: { $in: ['pending', 'partial'] } }),
    ]);

    // Notes en attente : Grade n'a pas de champ 'status' → on compte les non validées
    const pendingGrades = await Grade.countDocuments({ isValidated: false });

    res.json({
      success: true,
      data: {
        students:          totalStudents,
        teachers:          totalTeachers,
        staff:             totalStaff,
        courses:           totalCourses,
        pendingGrades,
        unpaidFees,
        recentEnrollments,
        deliberation:      deliberationStats,
      },
    });
  } catch (err) {
    console.error('[getAdminDashboard]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═════════════════════════════════════════════════════════════
// 3. DASHBOARD ENSEIGNANT
// ═════════════════════════════════════════════════════════════
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const myCourses = await Course.find({ teacher: teacherId })
      .populate('ue', 'code title credits')
      .lean();

    const courseIds = myCourses.map((c) => c._id);

    // Grade n'a pas de champ 'status' → notes non validées = isValidated: false
    const [pendingGrades, recentAbsences, totalEnrolled] = await Promise.all([
      Grade.countDocuments({ course: { $in: courseIds }, isValidated: false }),
      Attendance.find({ course: { $in: courseIds }, status: 'absent' })
        .sort({ date: -1 })
        .limit(5)
        .populate('student', 'firstName lastName studentId')
        .populate('course',  'code title')
        .lean(),
      Enrollment.countDocuments({ ue: { $in: myCourses.map((c) => c.ue?._id).filter(Boolean) } }),
    ]);

    res.json({
      success: true,
      data: {
        totalCourses:   myCourses.length,
        totalEnrolled,
        pendingGrades,
        recentAbsences,
        myCourses,
      },
    });
  } catch (err) {
    console.error('[getTeacherDashboard]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═════════════════════════════════════════════════════════════
// 4. DASHBOARD ÉTUDIANT
// ═════════════════════════════════════════════════════════════
exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    const [enrollments, grades, recentAttendances, deliberation] = await Promise.all([
      Enrollment.find({ student: studentId })
        .populate('ue',      'code title credits coefficient')
        .populate('program', 'name code')
        .lean(),
      Grade.find({ student: studentId })
        .populate('ue', 'code title credits')
        .lean(),
      Attendance.find({ student: studentId })
        .sort({ date: -1 })
        .limit(5)
        .populate('course', 'code title')
        .lean(),
      Deliberation.findOne({ student: studentId }).sort({ createdAt: -1 }).lean(),
    ]);

    const validGrades = grades.filter((g) => g.finalAverage > 0);
    const average =
      validGrades.length > 0
        ? +(validGrades.reduce((acc, g) => acc + g.finalAverage, 0) / validGrades.length).toFixed(2)
        : 0;

    // Taux de présence
    const totalAtt   = await Attendance.countDocuments({ student: studentId });
    const presentAtt = await Attendance.countDocuments({ student: studentId, status: 'present' });
    const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

    res.json({
      success: true,
      data: {
        enrollments:      enrollments.length,
        averageGrade:     average,
        attendanceRate,
        recentAttendances,
        grades,
        deliberation: deliberation
          ? {
              validated:            deliberation.validated,
              certificateGenerated: deliberation.certificateGenerated,
              mention:              deliberation.mention,
              certificateNumber:    deliberation.certificateNumber,
              session:              deliberation.session,
              generalAverage:       deliberation.generalAverage,
            }
          : null,
      },
    });
  } catch (err) {
    console.error('[getStudentDashboard]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═════════════════════════════════════════════════════════════
// 5. DASHBOARD STAFF
// ═════════════════════════════════════════════════════════════
exports.getStaffDashboard = async (req, res) => {
  try {
    const [totalStudents, totalEnrollments, unpaidFees, recentStudents] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Enrollment.countDocuments(),
      Fee.countDocuments({ status: { $in: ['pending', 'partial'] } }),
      User.find({ role: 'student' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName email studentId createdAt')
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        students:         totalStudents,
        enrollments:      totalEnrollments,
        unpaidFees,
        recentStudents,
      },
    });
  } catch (err) {
    console.error('[getStaffDashboard]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═════════════════════════════════════════════════════════════
// 6. DASHBOARD CHEF DE DÉPARTEMENT
// ═════════════════════════════════════════════════════════════
exports.getDepartmentHeadDashboard = async (req, res) => {
  try {
    // 'department' est une String sur le User (pas un ObjectId)
    const department = req.user.department;

    const [courses, teachers] = await Promise.all([
      Course.find({ /* pas de champ 'department' dans Course → on cherche via program */ })
        .populate({
          path:   'program',
          match:  { department },       // filtre sur le programme
          select: 'name code department',
        })
        .populate('teacher', 'firstName lastName')
        .lean(),
      User.find({ role: 'teacher', department }).select('firstName lastName employeeId title').lean(),
    ]);

    // Cours dont le programme correspond au département
    const deptCourses = courses.filter((c) => c.program !== null);

    const ueIds = [...new Set(deptCourses.map((c) => c.ue?.toString()).filter(Boolean))];
    const totalEnrolled = await Enrollment.countDocuments({ ue: { $in: ueIds } });

    res.json({
      success: true,
      data: {
        department,
        totalCourses:       deptCourses.length,
        totalTeachers:      teachers.length,
        totalEnrolled,
        averageClassSize:   deptCourses.length > 0 ? Math.round(totalEnrolled / deptCourses.length) : 0,
        teachers,
      },
    });
  } catch (err) {
    console.error('[getDepartmentHeadDashboard]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═════════════════════════════════════════════════════════════
// 7. DASHBOARD DYNAMIQUE selon le rôle connecté
// ═════════════════════════════════════════════════════════════
exports.getUserDashboard = async (req, res) => {
  const role = req.user?.role;

  switch (role) {
    case 'super_admin':           // ✅ super_admin → même dashboard qu'admin
    case 'admin':
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
      return res.status(400).json({ success: false, message: `Rôle non supporté : ${role}` });
  }
};