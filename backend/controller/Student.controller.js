const Student = require('../models/Student.model');
const User = require('../models/User.model');
const { success, created, notFound, paginated, badRequest } = require('../utils/apiResponse');
const { getPagination, buildSearchFilter, generateStudentId, getCurrentAcademicYear } = require('../utils/helpers');
const { exportStudentsToExcel, importStudentsFromExcel } = require('../services/Excel.service');
const { sendNotification } = require('../services/notification.service');

// GET /api/students
const getAllStudents = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, program, level, status, academicYear } = req.query;

    let filter = {};
    if (search) Object.assign(filter, buildSearchFilter(search, ['firstName', 'lastName', 'email', 'studentId']));
    if (program) filter.program = program;
    if (level) filter.level = level;
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('program', 'name code')
        .sort({ lastName: 1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
      Student.countDocuments(filter)
    ]);

    return paginated(res, students, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:id
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('program', 'name code type department');
    if (!student) return notFound(res, 'Étudiant introuvable.');
    return success(res, student);
  } catch (err) {
    next(err);
  }
};

// POST /api/students
const createStudent = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, program, level, currentSemester, academicYear, ...rest } = req.body;

    // Générer N° étudiant
    const count = await Student.countDocuments({ academicYear: academicYear || getCurrentAcademicYear() });
    const studentId = generateStudentId(new Date().getFullYear(), count + 1);

    const student = await Student.create({
      firstName, lastName, email,
      password: password || 'Etudiant@123',
      role: 'student',
      program, level, currentSemester,
      academicYear: academicYear || getCurrentAcademicYear(),
      studentId,
      ...rest
    });

    return created(res, student, 'Étudiant créé avec succès.');
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    const forbidden = ['password', 'role', 'email', 'studentId'];
    forbidden.forEach(f => delete req.body[f]);

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('program', 'name code');

    if (!student) return notFound(res, 'Étudiant introuvable.');
    return success(res, student, 'Étudiant mis à jour.');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/students/:id (désactivation)
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false, status: 'expelled' },
      { new: true }
    );
    if (!student) return notFound(res, 'Étudiant introuvable.');
    return success(res, null, 'Étudiant désactivé.');
  } catch (err) {
    next(err);
  }
};

// GET /api/students/export/excel
const exportStudents = async (req, res, next) => {
  try {
    const students = await Student.find({ isActive: true })
      .populate('program', 'name').lean();
    const buffer = await exportStudentsToExcel(students);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=etudiants.xlsx');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// POST /api/students/import/excel
const importStudents = async (req, res, next) => {
  try {
    if (!req.file) return badRequest(res, 'Fichier Excel requis.');
    const rows = await importStudentsFromExcel(req.file.buffer);
    const results = { created: 0, errors: [] };

    for (const row of rows) {
      try {
        const exists = await User.findOne({ email: row.email });
        if (!exists) {
          const count = await Student.countDocuments();
          await Student.create({
            ...row,
            role: 'student',
            studentId: generateStudentId(new Date().getFullYear(), count + 1),
            password: 'Etudiant@123',
            academicYear: getCurrentAcademicYear()
          });
          results.created++;
        } else {
          results.errors.push(`Email déjà utilisé : ${row.email}`);
        }
      } catch (e) {
        results.errors.push(`Erreur ligne ${row.email}: ${e.message}`);
      }
    }

    return success(res, results, `Import terminé : ${results.created} étudiants créés.`);
  } catch (err) {
    next(err);
  }
};

// GET /api/students/me/profile (étudiant connecté)
const getMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user._id)
      .populate('program', 'name code type department');
    if (!student) return notFound(res, 'Profil introuvable.');
    return success(res, student);
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getAllStudents,
  getMyProfile,
  getStudentById,
  createStudent,
  updateStudent,        // ← Doit exister
  deleteStudent,
  exportStudents,
  importStudents,
  // updateMyProfile,   // si tu l'utilises
};