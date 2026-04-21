const Internship = require('../models/Internship.model');
const Company = require('../models/Company.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');


// INTERNSHIPS
exports.getAllInternships = async (req, res) => {
  try {
    const { page = 1, limit = 10, student, company, status, type } = req.query;
    const filter = {};
    if (student) filter.student = student;
    if (company) filter.company = company;
    if (status) filter.status = status;
    if (type) filter.type = type;

    const total = await Internship.countDocuments(filter);
    const internships = await Internship.find(filter)
      .populate('student', 'firstName lastName matricule')
      .populate('company', 'name sector')
      .populate('supervisor', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ startDate: -1 });

    return paginatedResponse(res, internships, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('student company supervisor');
    if (!internship) return errorResponse(res, 'Stage introuvable', 404);
    return successResponse(res, internship);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.createInternship = async (req, res) => {
  try {
    const internship = await Internship.create(req.body);
    return successResponse(res, internship, 'Stage crÃ©Ã©', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!internship) return errorResponse(res, 'Stage introuvable', 404);
    return successResponse(res, internship, 'Stage mis Ã  jour');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.deleteInternship = async (req, res) => {
  try {
    await Internship.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Stage supprimÃ©');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// COMPANIES
exports.getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sector } = req.query;
    const filter = {};
    if (search) filter.name = new RegExp(search, 'i');
    if (sector) filter.sector = sector;

    const total = await Company.countDocuments(filter);
    const companies = await Company.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ name: 1 });

    return paginatedResponse(res, companies, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    return successResponse(res, company, 'Entreprise ajoutÃ©e', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) return errorResponse(res, 'Entreprise introuvable', 404);
    return successResponse(res, company, 'Entreprise mise Ã  jour');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Entreprise supprimÃ©e');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
