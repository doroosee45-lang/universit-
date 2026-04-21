const Teacher = require('../models/Teacher.model');
const User = require('../models/User.model');
const { success, created, notFound, paginated, badRequest } = require('../utils/apiResponse');
const { getPagination, buildSearchFilter, generateTeacherId } = require('../utils/helpers');


// GET /api/teachers
const getAllTeachers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, department } = req.query;

    let filter = {};
    if (search) Object.assign(filter, buildSearchFilter(search, ['firstName', 'lastName', 'email', 'employeeId']));
    if (department) filter.department = department;

    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .populate('courses', 'title code type')
        .sort({ lastName: 1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
      Teacher.countDocuments(filter)
    ]);

    return paginated(res, teachers, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/teachers/:id
const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('courses', 'title code type')
      .populate('responsibleUEs', 'code title credits');
    if (!teacher) return notFound(res, 'Enseignant introuvable.');
    return success(res, teacher);
  } catch (err) {
    next(err);
  }
};

// POST /api/teachers
const createTeacher = async (req, res, next) => {
  try {
    const count = await Teacher.countDocuments();
    const employeeId = generateTeacherId(new Date().getFullYear(), count + 1);

    const teacher = await Teacher.create({
      ...req.body,
      role: 'teacher',
      employeeId,
      password: req.body.password || 'Enseignant@123'
    });

    return created(res, teacher, 'Enseignant créé avec succès.');
  } catch (err) {
    next(err);
  }
};

// PUT /api/teachers/:id
const updateTeacher = async (req, res, next) => {
  try {
    ['password', 'role', 'employeeId'].forEach(f => delete req.body[f]);

    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!teacher) return notFound(res, 'Enseignant introuvable.');
    return success(res, teacher, 'Enseignant mis à jour.');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/teachers/:id
const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!teacher) return notFound(res, 'Enseignant introuvable.');
    return success(res, null, 'Enseignant désactivé.');
  } catch (err) {
    next(err);
  }
};

// GET /api/teachers/me/courses (enseignant connecté)
const getMyCourses = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.user._id)
      .populate({ path: 'courses', populate: { path: 'ue', select: 'code title credits' } });
    if (!teacher) return notFound(res, 'Profil introuvable.');
    return success(res, teacher.courses);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher, getMyCourses };