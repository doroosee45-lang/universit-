const Program = require('../models/Program.model');
const UE = require('../models/UE.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');


// GET /api/programs
exports.getAllPrograms = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, level, status } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (level) filter.level = level;
    if (status) filter.status = status;

    const total = await Program.countDocuments(filter);
    const programs = await Program.find(filter)
      .populate('coordinator', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(res, programs, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// GET /api/programs/:id
exports.getProgramById = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate('coordinator', 'firstName lastName email')
      .populate('ues');
    if (!program) return errorResponse(res, 'FiliÃ¨re introuvable', 404);
    return successResponse(res, program);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// POST /api/programs
exports.createProgram = async (req, res) => {
  try {
    const program = await Program.create(req.body);
    return successResponse(res, program, 'FiliÃ¨re crÃ©Ã©e avec succÃ¨s', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// PUT /api/programs/:id
exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!program) return errorResponse(res, 'FiliÃ¨re introuvable', 404);
    return successResponse(res, program, 'FiliÃ¨re mise Ã  jour');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// DELETE /api/programs/:id
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) return errorResponse(res, 'FiliÃ¨re introuvable', 404);
    return successResponse(res, null, 'FiliÃ¨re supprimÃ©e');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// GET /api/programs/:id/ues
exports.getProgramUEs = async (req, res) => {
  try {
    const ues = await UE.find({ program: req.params.id }).sort({ semester: 1 });
    return successResponse(res, ues);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
