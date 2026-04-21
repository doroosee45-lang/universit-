const Grade = require('../models/Grade.model');
const Enrollment = require('../models/Enrollment.model');
const UE = require('../models/UE.model');
const { success, created, notFound, paginated, badRequest } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const { calculateUEAverage, getMention, isUEValidated } = require('../utils/calculator');
const { sendGradesPublished } = require('../services/email.service');
const { generateTranscriptPDF } = require('../services/pdf.service');
const { exportGradesToExcel } = require('../services/excel.service');
const { sendNotification } = require('../services/notification.service');

// GET /api/grades  (admin: toutes, teacher: ses UEs, student: ses notes)
const getGrades = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { student, ue, academicYear, semester, session } = req.query;

    let filter = {};
    if (student) filter.student = student;
    if (ue) filter.ue = ue;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    if (session) filter.session = session;

    // Étudiant : uniquement ses propres notes
    if (req.user.role === 'student') filter.student = req.user._id;

    const [grades, total] = await Promise.all([
      Grade.find(filter)
        .populate('student', 'firstName lastName studentId')
        .populate('ue', 'code title coefficient credits')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Grade.countDocuments(filter)
    ]);

    return paginated(res, grades, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// POST /api/grades  - Saisir/mettre à jour une note
const upsertGrade = async (req, res, next) => {
  try {
    const { student, ue, academicYear, semester, session, assessments } = req.body;

    // Calculer la moyenne automatiquement
    const average = calculateUEAverage(assessments);
    const ueData = await UE.findById(ue);
    if (!ueData) return notFound(res, 'UE introuvable.');

    const gradeData = {
      student, ue, program: ueData.program, academicYear, semester,
      session: session || 'session1',
      assessments,
      average,
      mention: getMention(average),
      isValidated: isUEValidated(average),
      ectsObtained: isUEValidated(average) ? ueData.credits : 0,
      finalAverage: average
    };

    const grade = await Grade.findOneAndUpdate(
      { student, ue, academicYear, session: session || 'session1' },
      gradeData,
      { new: true, upsert: true, runValidators: true }
    ).populate('student', 'firstName lastName email studentId')
     .populate('ue', 'code title');

    return success(res, grade, 'Note enregistrée.');
  } catch (err) {
    next(err);
  }
};

// PUT /api/grades/:id/session2 - Note de rattrapage
const addSession2Grade = async (req, res, next) => {
  try {
    const { score } = req.body;
    const grade = await Grade.findById(req.params.id).populate('ue');
    if (!grade) return notFound(res, 'Note introuvable.');

    grade.session2Score = score;
    // La note finale est le max entre session 1 et session 2
    grade.finalAverage = Math.max(grade.average, score);
    grade.isValidated = isUEValidated(grade.finalAverage);
    grade.ectsObtained = grade.isValidated ? grade.ue.credits : 0;
    grade.mention = getMention(grade.finalAverage);
    await grade.save();

    return success(res, grade, 'Note de rattrapage enregistrée.');
  } catch (err) {
    next(err);
  }
};

// POST /api/grades/bulk  - Saisie en masse pour une UE
const bulkUpsertGrades = async (req, res, next) => {
  try {
    const { ue, academicYear, semester, session, grades } = req.body;
    const ueData = await UE.findById(ue);
    if (!ueData) return notFound(res, 'UE introuvable.');

    const results = [];
    for (const g of grades) {
      const average = calculateUEAverage(g.assessments);
      const result = await Grade.findOneAndUpdate(
        { student: g.student, ue, academicYear, session: session || 'session1' },
        {
          student: g.student, ue, program: ueData.program,
          academicYear, semester, session: session || 'session1',
          assessments: g.assessments,
          average,
          mention: getMention(average),
          isValidated: isUEValidated(average),
          ectsObtained: isUEValidated(average) ? ueData.credits : 0,
          finalAverage: average
        },
        { new: true, upsert: true }
      );
      results.push(result);
    }

    return success(res, { count: results.length }, `${results.length} notes enregistrées.`);
  } catch (err) {
    next(err);
  }
};

// POST /api/grades/publish/:ue - Publier les notes d'une UE (notif étudiants)
const publishGrades = async (req, res, next) => {
  try {
    const { ue, academicYear, semester } = req.body;
    const ueData = await UE.findById(ue);
    if (!ueData) return notFound(res, 'UE introuvable.');

    const grades = await Grade.find({ ue, academicYear, semester })
      .populate('student', 'firstName email');

    // Notifier chaque étudiant
    for (const grade of grades) {
      await sendNotification({
        recipient: grade.student._id,
        sender: req.user._id,
        type: 'success',
        title: 'Notes disponibles',
        message: `Vos notes pour l'UE ${ueData.title} (${semester}) ont été publiées.`,
        link: '/etudiant/grades'
      });
    }

    return success(res, { notified: grades.length }, 'Notes publiées et étudiants notifiés.');
  } catch (err) {
    next(err);
  }
};

// GET /api/grades/student/:studentId/transcript  - Relevé de notes
const getStudentTranscript = async (req, res, next) => {
  try {
    const { academicYear, semester } = req.query;
    const studentId = req.params.studentId;

    const grades = await Grade.find({ student: studentId, academicYear, semester })
      .populate('ue', 'code title coefficient credits')
      .populate('student', 'firstName lastName studentId ine')
      .populate('program', 'name');

    return success(res, grades);
  } catch (err) {
    next(err);
  }
};

// GET /api/grades/student/:studentId/transcript/pdf
const downloadTranscriptPDF = async (req, res, next) => {
  try {
    const { academicYear, semester } = req.query;
    const grades = await Grade.find({ student: req.params.studentId, academicYear, semester })
      .populate('student', 'firstName lastName studentId ine')
      .populate('ue', 'code title coefficient credits')
      .populate('program', 'name');

    if (!grades.length) return notFound(res, 'Aucune note trouvée.');

    const student = grades[0].student;
    const program = grades[0].program;
    const ueGrades = grades.map(g => ({
      ueCode: g.ue?.code, ueTitle: g.ue?.title,
      coefficient: g.ue?.coefficient, credits: g.ue?.credits,
      average: g.finalAverage, mention: g.mention,
      isValidated: g.isValidated, ectsObtained: g.ectsObtained
    }));
    const semesterAverage = ueGrades.reduce((s, g) => s + g.average * g.coefficient, 0) /
      ueGrades.reduce((s, g) => s + g.coefficient, 0);

    const pdf = await generateTranscriptPDF({
      student, program, ueGrades, semesterAverage,
      semester, academicYear,
      totalECTS: ueGrades.reduce((s, g) => s + (g.ectsObtained || 0), 0),
      schoolName: 'Université'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=releve_${student.studentId}_${semester}.pdf`);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
};

// GET /api/grades/ue/:ueId/export
const exportUEGradesExcel = async (req, res, next) => {
  try {
    const { academicYear, semester } = req.query;
    const grades = await Grade.find({ ue: req.params.ueId, academicYear, semester })
      .populate('student', 'firstName lastName studentId')
      .populate('ue', 'title');

    const ue = grades[0]?.ue;
    const buffer = await exportGradesToExcel(grades, ue?.title || 'UE');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=notes_${ue?.title || 'ue'}.xlsx`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGrades, upsertGrade, addSession2Grade, bulkUpsertGrades,
  publishGrades, getStudentTranscript, downloadTranscriptPDF, exportUEGradesExcel
};