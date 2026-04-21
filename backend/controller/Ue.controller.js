const UE = require('../models/UE.model');
const Course = require('../models/Course.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');


exports.getAllUEs = async (req, res) => {
  try {
    const { page = 1, limit = 10, program, semester } = req.query;
    const filter = {};
    if (program) filter.program = program;
    if (semester) filter.semester = semester;

    const total = await UE.countDocuments(filter);
    const ues = await UE.find(filter)
      .populate('program', 'name code')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return paginatedResponse(res, ues, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getUEById = async (req, res) => {
  try {
    const ue = await UE.findById(req.params.id).populate('program', 'name code');
    if (!ue) return errorResponse(res, 'UE introuvable', 404);
    return successResponse(res, ue);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.createUE = async (req, res) => {
  try {
    const ue = await UE.create(req.body);
    return successResponse(res, ue, 'UE crÃ©Ã©e', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.updateUE = async (req, res) => {
  try {
    const ue = await UE.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ue) return errorResponse(res, 'UE introuvable', 404);
    return successResponse(res, ue, 'UE mise Ã  jour');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.deleteUE = async (req, res) => {
  try {
    await UE.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'UE supprimÃ©e');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getUECourses = async (req, res) => {
  try {
    const courses = await Course.find({ ue: req.params.id })
      .populate('teacher', 'firstName lastName');
    return successResponse(res, courses);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
