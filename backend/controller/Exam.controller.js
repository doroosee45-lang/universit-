const Exam = require('../models/Exam.model');
const Grade = require('../models/Grade.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');


exports.getAllExams = async (req, res) => {
  try {
    const { page = 1, limit = 10, program, course, type, status } = req.query;
    const filter = {};
    if (program) filter.program = program;
    if (course) filter.course = course;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const total = await Exam.countDocuments(filter);
    const exams = await Exam.find(filter)
      .populate('course', 'name code')
      .populate('room', 'name building')
      .populate('supervisors', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ date: 1 });

    return paginatedResponse(res, exams, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('course room supervisors');
    if (!exam) return errorResponse(res, 'Examen introuvable', 404);
    return successResponse(res, exam);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    return successResponse(res, exam, 'Examen planifiÃ©', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return errorResponse(res, 'Examen introuvable', 404);
    return successResponse(res, exam, 'Examen mis Ã  jour');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Examen supprimÃ©');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getExamResults = async (req, res) => {
  try {
    const grades = await Grade.find({ exam: req.params.id })
      .populate('student', 'firstName lastName matricule')
      .sort({ score: -1 });
    return successResponse(res, grades);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.publishResults = async (req, res) => {
  try {
    await Exam.findByIdAndUpdate(req.params.id, { status: 'results_published' });
    await Grade.updateMany({ exam: req.params.id }, { published: true });
    return successResponse(res, null, 'RÃ©sultats publiÃ©s');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
