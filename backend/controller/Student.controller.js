const crypto = require('crypto');
const Student = require('../models/Student.model');
const User = require('../models/User.model');
const { success, created, notFound, paginated, badRequest } = require('../utils/apiResponse');
const { getPagination, buildSearchFilter, generateStudentId, getCurrentAcademicYear, generateToken } = require('../utils/helpers');
const { exportStudentsToExcel, importStudentsFromExcel } = require('../services/Excel.service');
const { sendActivationEmail } = require('../services/email.service');

// Génère un mot de passe temporaire lisible (12 chars)
const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specials = '@#$!';
  let pass = '';
  for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  pass += specials[Math.floor(Math.random() * specials.length)];
  pass += Math.floor(Math.random() * 90 + 10);
  // Mélanger pour éviter un pattern prévisible
  return pass.split('').sort(() => Math.random() - 0.5).join('');
};

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
    const {
      firstName, lastName, email,
      program, level, currentSemester, academicYear,
      ...rest
    } = req.body;

    // Vérifier l'unicité de l'email
    const existing = await User.findOne({ email: email?.toLowerCase() });
    if (existing) return badRequest(res, 'Cet email est déjà utilisé.');

    // Générer le matricule
    const year = new Date().getFullYear();
    const count = await Student.countDocuments();
    const studentId = generateStudentId(year, count + 1);

    // Générer le mot de passe temporaire
    const tempPassword = generateTempPassword();

    // Générer le token d'activation (48h)
    const rawActivationToken = generateToken(32);
    const hashedActivationToken = crypto.createHash('sha256').update(rawActivationToken).digest('hex');

    const student = await Student.create({
      firstName,
      lastName,
      email,
      password: tempPassword,
      role: 'student',
      program,
      level,
      currentSemester,
      academicYear: academicYear || getCurrentAcademicYear(),
      studentId,
      mustChangePassword: true,
      activationToken: hashedActivationToken,
      activationTokenExpires: new Date(Date.now() + 48 * 60 * 60 * 1000),
      ...rest
    });

    // Envoyer l'email d'activation (ne bloque pas si ça échoue)
    sendActivationEmail(student, rawActivationToken, tempPassword).catch(err => {
      console.error('Erreur envoi email activation:', err.message);
    });

    // Ne pas renvoyer le mot de passe en clair dans la réponse
    const studentOut = student.toObject();
    delete studentOut.password;

    return created(res, studentOut, `Étudiant créé. Email d'activation envoyé à ${email}.`);
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    const forbidden = ['password', 'role', 'email', 'studentId', 'activationToken', 'mustChangePassword'];
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

// DELETE /api/students/:id (désactivation douce)
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
        if (exists) {
          results.errors.push(`Email déjà utilisé : ${row.email}`);
          continue;
        }

        const count = await Student.countDocuments();
        const tempPassword = generateTempPassword();
        const rawToken = generateToken(32);
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        const student = await Student.create({
          ...row,
          role: 'student',
          studentId: generateStudentId(new Date().getFullYear(), count + 1),
          password: tempPassword,
          mustChangePassword: true,
          activationToken: hashedToken,
          activationTokenExpires: new Date(Date.now() + 48 * 60 * 60 * 1000),
          academicYear: row.academicYear || getCurrentAcademicYear()
        });

        sendActivationEmail(student, rawToken, tempPassword).catch(() => {});
        results.created++;
      } catch (e) {
        results.errors.push(`Erreur (${row.email}): ${e.message}`);
      }
    }

    return success(res, results, `Import terminé : ${results.created} étudiant(s) créé(s).`);
  } catch (err) {
    next(err);
  }
};

// POST /api/students/:id/photo
const uploadStudentPhoto = async (req, res, next) => {
  try {
    if (!req.file) return badRequest(res, 'Aucun fichier uploadé.');

    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { profilePhoto: photoUrl },
      { new: true }
    ).populate('program', 'name code');

    if (!student) return notFound(res, 'Étudiant introuvable.');
    return success(res, { profilePhoto: photoUrl, student }, 'Photo mise à jour.');
  } catch (err) {
    next(err);
  }
};

// GET /api/students/me/profile
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
  updateStudent,
  deleteStudent,
  exportStudents,
  importStudents,
  uploadStudentPhoto
};
