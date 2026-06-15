const Exam         = require('../models/Exam.model');
const Grade        = require('../models/Grade.model');
const Notification = require('../models/Notification.model');

// ✅ Chargement des modèles pour les populates
require('../models/Room.model');
require('../models/User.model');

const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

// ─── GET /api/exams ───────────────────────────────────────────────────────────
exports.getAllExams = async (req, res) => {
  try {
    const {
      page = 1, limit = 10,
      program, ue, course, type, status,
      session, isPublished, promotion, academicYear
    } = req.query;

    const filter = {};
    if (program)      filter.program      = program;
    if (ue)           filter.ue           = ue;
    if (course)       filter.course       = course;
    if (type)         filter.type         = type;
    if (status)       filter.status       = status;
    if (session)      filter.session      = session;
    if (promotion)    filter.promotion    = promotion;
    if (academicYear) filter.academicYear = academicYear;

    if (isPublished !== undefined && isPublished !== '') {
      filter.isPublished = isPublished === 'true' || isPublished === true;
    }

    const total = await Exam.countDocuments(filter);
    const exams = await Exam.find(filter)
      .populate('ue',          'name code title')
      .populate('course',      'name code title')
      .populate('program',     'name code')
      .populate('room',        'name building')
      .populate('supervisors', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ startDate: 1 });

    return paginatedResponse(res, exams, total, page, limit);
  } catch (err) {
    console.error('❌ getAllExams ERROR:', err.message);
    return errorResponse(res, err.message);
  }
};

// ─── GET /api/exams/:id ───────────────────────────────────────────────────────
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('ue',          'name code title')
      .populate('course',      'name code')
      .populate('program',     'name code')
      .populate('room',        'name building')
      .populate('supervisors', 'firstName lastName');

    if (!exam) return errorResponse(res, 'Examen introuvable', 404);
    return successResponse(res, exam);
  } catch (err) {
    console.error('❌ getExamById ERROR:', err.message);
    return errorResponse(res, err.message);
  }
};

// ─── POST /api/exams ──────────────────────────────────────────────────────────
exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);

    const populated = await Exam.findById(exam._id)
      .populate('ue',      'name code title')
      .populate('program', 'name code')
      .populate('room',    'name building');

    return successResponse(res, populated, 'Examen planifié', 201);
  } catch (err) {
    console.error('❌ createExam ERROR:', err.message);
    return errorResponse(res, err.message);
  }
};

// ─── PUT /api/exams/:id ───────────────────────────────────────────────────────
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('ue',      'name code title')
      .populate('program', 'name code')
      .populate('room',    'name building');

    if (!exam) return errorResponse(res, 'Examen introuvable', 404);
    return successResponse(res, exam, 'Examen mis à jour');
  } catch (err) {
    console.error('❌ updateExam ERROR:', err.message);
    return errorResponse(res, err.message);
  }
};

// ─── DELETE /api/exams/:id ────────────────────────────────────────────────────
exports.deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Examen supprimé');
  } catch (err) {
    console.error('❌ deleteExam ERROR:', err.message);
    return errorResponse(res, err.message);
  }
};

// ─── GET /api/exams/:id/results ───────────────────────────────────────────────
exports.getExamResults = async (req, res) => {
  try {
    const grades = await Grade.find({ exam: req.params.id })
      .populate('student', 'firstName lastName matricule')
      .sort({ score: -1 });

    return successResponse(res, grades);
  } catch (err) {
    console.error('❌ getExamResults ERROR:', err.message);
    return errorResponse(res, err.message);
  }
};

// ─── POST /api/exams/:id/publish ─────────────────────────────────────────────
exports.publishResults = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { isPublished: true, status: 'completed' },
      { new: true }
    );

    if (!exam) return errorResponse(res, 'Examen introuvable', 404);

    await Grade.updateMany({ exam: req.params.id }, { published: true });
    return successResponse(res, exam, 'Résultats publiés');
  } catch (err) {
    console.error('❌ publishResults ERROR:', err.message);
    return errorResponse(res, err.message);
  }
};

// ─── POST /api/exams/publish-schedule ────────────────────────────────────────
// Publie un lot d'examens et envoie les notifications aux étudiants + surveillants
exports.publishSchedule = async (req, res) => {
  try {
    const { session, academicYear, examIds } = req.body;

    // Construire le filtre
    const filter = { isPublished: false };
    if (examIds && Array.isArray(examIds) && examIds.length > 0) {
      filter._id = { $in: examIds };
    } else {
      if (session)      filter.session      = session;
      if (academicYear) filter.academicYear = academicYear;
    }

    const exams = await Exam.find(filter)
      .populate('program',     'name code')
      .populate('supervisors', '_id firstName lastName');

    if (exams.length === 0) {
      return successResponse(res, { published: 0, notifications: 0 }, 'Aucun examen à publier pour ces critères.');
    }

    // Publier tous les examens trouvés
    const ids = exams.map(e => e._id);
    await Exam.updateMany({ _id: { $in: ids } }, { isPublished: true });

    // ── Notifications étudiants : une par programme ───────────────────────────
    const programMap = {};
    exams.forEach(e => {
      const pid = e.program?._id?.toString();
      if (!pid) return;
      if (!programMap[pid]) programMap[pid] = { name: e.program.name, count: 0, program: e.program._id };
      programMap[pid].count++;
    });

    const notifs = [];

    for (const pid of Object.keys(programMap)) {
      const p = programMap[pid];
      notifs.push({
        sender:           req.user._id,
        recipientRole:    'student',
        recipientProgram: p.program,
        type:             'info',
        title:            "Horaire d'examens publié",
        message:          `L'horaire des examens${session ? ` de ${session}` : ''}${academicYear ? ` (${academicYear})` : ''} est disponible pour ${p.name}. ${p.count} examen(s) planifié(s).`,
        link:             '/student/exams',
        isBroadcast:      true,
      });
    }

    // ── Notifications enseignants : une par surveillant ───────────────────────
    const supervisorMap = {};
    exams.forEach(e => {
      (e.supervisors || []).forEach(s => {
        const sid = s._id.toString();
        if (!supervisorMap[sid]) supervisorMap[sid] = { _id: s._id, count: 0 };
        supervisorMap[sid].count++;
      });
    });

    for (const sid of Object.keys(supervisorMap)) {
      const s = supervisorMap[sid];
      notifs.push({
        sender:    req.user._id,
        recipient: s._id,
        type:      'info',
        title:     'Programme de surveillance publié',
        message:   `Votre programme de surveillance${session ? ` pour ${session}` : ''}${academicYear ? ` (${academicYear})` : ''} est disponible. Vous avez ${s.count} examen(s) à surveiller.`,
        link:      '/teacher/exams',
      });
    }

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    return successResponse(res, {
      published:     exams.length,
      notifications: notifs.length,
    }, `${exams.length} examen(s) publié(s) — ${notifs.length} notification(s) envoyée(s).`);
  } catch (err) {
    console.error('❌ publishSchedule ERROR:', err.message);
    return errorResponse(res, err.message);
  }
};

// ─── GET /api/exams/teacher/me ────────────────────────────────────────────────
exports.getTeacherExams = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const exams = await Exam.find({
      $or: [
        { supervisors: teacherId },
        { teacher:     teacherId },
      ]
    })
      .populate('ue',          'name code title')
      .populate('program',     'name code')
      .populate('room',        'name building')
      .populate('supervisors', 'firstName lastName')
      .sort({ startDate: 1 });

    return successResponse(res, exams);
  } catch (err) {
    console.error('❌ getTeacherExams ERROR:', err.message);
    return errorResponse(res, err.message);
  }
};