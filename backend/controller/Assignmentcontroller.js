const Assignment = require('../models/Assignment.model');
const Submission = require('../models/Submission.model');
const User = require('../models/User.model'); // doit avoir un champ group/class
const path = require('path');

// ─── TEACHER : créer un devoir ─────────────────────────────────────────────
exports.createAssignment = async (req, res) => {
  try {
    const data = { ...req.body, teacher: req.user._id };

    // Publier automatiquement si isPublished=true
    if (data.isPublished) data.publishedAt = new Date();

    const assignment = await Assignment.create(data);
    await assignment.populate(['course', 'ue', 'teacher']);

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    console.error('createAssignment error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── TEACHER : modifier un devoir ─────────────────────────────────────────
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!assignment) return res.status(404).json({ success: false, message: 'Devoir non trouvé' });

    // Si on publie maintenant et n'était pas publié avant
    if (req.body.isPublished && !assignment.isPublished) {
      req.body.publishedAt = new Date();
    }

    Object.assign(assignment, req.body);
    await assignment.save();
    await assignment.populate(['course', 'ue']);

    res.json({ success: true, data: assignment });
  } catch (err) {
    console.error('updateAssignment error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── TEACHER : supprimer un devoir ────────────────────────────────────────
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    if (!assignment) return res.status(404).json({ success: false, message: 'Devoir non trouvé' });

    // Supprimer toutes les soumissions liées
    await Submission.deleteMany({ assignment: req.params.id });

    res.json({ success: true, message: 'Devoir supprimé' });
  } catch (err) {
    console.error('deleteAssignment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── TEACHER : liste de ses devoirs ───────────────────────────────────────
exports.getTeacherAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { teacher: req.user._id };

    const [data, total] = await Promise.all([
      Assignment.find(filter)
        .populate('course', 'title code')
        .populate('ue', 'title code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Assignment.countDocuments(filter),
    ]);

    res.json({ success: true, data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('getTeacherAssignments error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STUDENT : liste des devoirs de sa classe ─────────────────────────────
// L'étudiant a un champ `group` (ex: "L3-INFO-A") dans son profil User
// Le teacher cible des groupes dans le champ `groups` de l'assignment
exports.getStudentAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const student = await User.findById(req.user._id).select('group program academicYear');
    if (!student) return res.status(404).json({ success: false, message: 'Étudiant non trouvé' });

    // Filtrer les devoirs publiés qui concernent le groupe de l'étudiant
    // groups: [] = visible par tous, sinon filtré par groupe
    const filter = {
      isPublished: true,
      $or: [
        { groups: { $size: 0 } },      // aucun groupe spécifié = tous
        { groups: student.group },      // groupe de l'étudiant inclus
        { groups: { $exists: false } }  // champ absent = tous
      ]
    };

    // Filtre optionnel par programme et année académique
    if (student.program) filter.program = student.program;
    if (student.academicYear) filter.academicYear = student.academicYear;

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .populate('course', 'title code')
        .populate('ue', 'title code')
        .populate('teacher', 'firstName lastName')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Assignment.countDocuments(filter),
    ]);

    // Enrichir chaque devoir avec le statut de soumission de l'étudiant
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
      student: req.user._id,
    }).select('assignment submittedAt files comment isLate');

    const submissionMap = {};
    submissions.forEach(s => { submissionMap[s.assignment.toString()] = s; });

    const data = assignments.map(a => {
      const aObj = a.toObject();
      const submission = submissionMap[a._id.toString()];
      if (submission) {
        aObj.submittedAt = submission.submittedAt;
        aObj.submissionFiles = submission.files;
        aObj.submissionComment = submission.comment;
        aObj.isLate = submission.isLate;
      }
      return aObj;
    });

    res.json({ success: true, data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('getStudentAssignments error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STUDENT : soumettre un devoir ────────────────────────────────────────
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Devoir non trouvé' });
    if (!assignment.isPublished) return res.status(403).json({ success: false, message: 'Devoir non publié' });

    const { comment = '' } = req.body;
    const isLate = new Date() > new Date(assignment.dueDate);

    // Construire la liste des fichiers uploadés
    const files = (req.files || []).map(f => ({
      name: f.originalname,
      url: `/uploads/${f.filename}`,
      size: f.size,
    }));

    // Upsert : créer ou remplacer la soumission
    const submission = await Submission.findOneAndUpdate(
      { assignment: req.params.id, student: req.user._id },
      { comment, files, submittedAt: new Date(), isLate },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: submission });
  } catch (err) {
    console.error('submitAssignment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STUDENT : statut de soumission ──────────────────────────────────────
exports.getSubmissionStatus = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.id,
      student: req.user._id,
    });

    if (!submission) return res.status(404).json({ success: false, data: null });

    res.json({ success: true, data: submission });
  } catch (err) {
    console.error('getSubmissionStatus error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── TEACHER : voir les soumissions d'un devoir ───────────────────────────
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!assignment) return res.status(404).json({ success: false, message: 'Devoir non trouvé' });

    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'firstName lastName email group')
      .sort({ submittedAt: -1 });

    res.json({ success: true, data: submissions, total: submissions.length });
  } catch (err) {
    console.error('getAssignmentSubmissions error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

