const Course = require('../models/Course.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

exports.getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, ue, teacher, type } = req.query;
    const filter = {};
    if (ue) filter.ue = ue;
    if (teacher) filter.teacher = teacher;
    if (type) filter.type = type;

    const total = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .populate('ue', 'name code')
      .populate('teacher', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return paginatedResponse(res, courses, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('ue', 'name code')
      .populate('teacher', 'firstName lastName email');
    if (!course) return errorResponse(res, 'Cours introuvable', 404);
    return successResponse(res, course);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    return successResponse(res, course, 'Cours crÃ©Ã©', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return errorResponse(res, 'Cours introuvable', 404);
    return successResponse(res, course, 'Cours mis Ã  jour');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Cours supprimÃ©');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
