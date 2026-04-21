const Deliberation = require('../models/Deliberation');
const User = require('../models/User.model');
const Program = require('../models/Program.model');

// Obtenir la liste des étudiants éligibles pour délibération (moyenne >= 10)
exports.getEligibleStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, programId, academicYear, session } = req.query;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (session) filter.session = session;
    if (programId) filter.program = programId;
    
    // Recherche des étudiants (rôle 'student') avec moyenne générale calculée
    let studentsQuery = User.find({ role: 'student' }).populate('program');
    if (search) {
      studentsQuery = studentsQuery.or([
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ]);
    }
    if (programId) studentsQuery = studentsQuery.where('program').equals(programId);
    
    const allStudents = await studentsQuery;
    
    // Simuler le calcul de la moyenne générale (à adapter selon votre logique métier)
    const eligibleStudents = allStudents.filter(s => (s.generalAverage || 0) >= 10);
    
    // Pagination manuelle
    const total = eligibleStudents.length;
    const paginated = eligibleStudents.slice(skip, skip + limit);
    
    // Enrichir avec les infos de délibération existantes
    const deliberations = await Deliberation.find({ student: { $in: paginated.map(s => s._id) }, academicYear, session });
    const studentsWithStatus = paginated.map(s => {
      const delib = deliberations.find(d => d.student.toString() === s._id.toString());
      return {
        ...s.toObject(),
        hasDeliberated: !!delib?.validated,
        hasCertificate: !!delib?.certificateGenerated,
        deliberationId: delib?._id,
        remarks: delib?.remarks
      };
    });
    
    res.json({ data: studentsWithStatus, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Valider la délibération d'un étudiant
exports.validateDeliberation = async (req, res) => {
  try {
    const { studentId, remarks } = req.body;
    const { academicYear, session } = req.query;
    const userId = req.user._id;
    
    // Récupérer l'étudiant et sa moyenne
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') return res.status(404).json({ message: 'Étudiant non trouvé' });
    
    const avg = student.generalAverage || 0;
    let mention = '';
    if (avg >= 16) mention = 'Très Bien';
    else if (avg >= 14) mention = 'Bien';
    else if (avg >= 12) mention = 'Assez Bien';
    else if (avg >= 10) mention = 'Passable';
    else mention = 'Non validé';
    
    let deliberation = await Deliberation.findOne({ student: studentId, academicYear, session });
    if (deliberation) {
      deliberation.validated = true;
      deliberation.validatedAt = new Date();
      deliberation.validatedBy = userId;
      deliberation.remarks = remarks || deliberation.remarks;
      deliberation.mention = mention;
    } else {
      deliberation = new Deliberation({
        student: studentId,
        program: student.program,
        academicYear,
        session,
        generalAverage: avg,
        mention,
        validated: true,
        validatedAt: new Date(),
        validatedBy: userId,
        remarks
      });
    }
    await deliberation.save();
    
    res.json({ message: 'Délibération validée', deliberation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Générer un certificat/diplôme
exports.generateCertificate = async (req, res) => {
  try {
    const { studentId } = req.body;
    const { academicYear, session } = req.query;
    
    const deliberation = await Deliberation.findOne({ student: studentId, academicYear, session });
    if (!deliberation || !deliberation.validated) {
      return res.status(400).json({ message: 'L\'étudiant n\'a pas été délibéré' });
    }
    
    if (deliberation.certificateGenerated) {
      return res.status(400).json({ message: 'Certificat déjà généré' });
    }
    
    // Générer un numéro de certificat unique
    const certificateNumber = `DIP-${Date.now()}-${studentId.slice(-4)}`;
    deliberation.certificateGenerated = true;
    deliberation.certificateNumber = certificateNumber;
    await deliberation.save();
    
    // Ici vous pouvez générer un PDF et l'uploader, ou simplement retourner les infos
    res.json({ message: 'Certificat généré', certificateNumber, deliberation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtenir les statistiques de délibération
exports.getStats = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = academicYear ? { academicYear } : {};
    
    const totalEligible = await User.countDocuments({ role: 'student', generalAverage: { $gte: 10 } });
    const deliberated = await Deliberation.countDocuments({ ...filter, validated: true });
    const certified = await Deliberation.countDocuments({ ...filter, certificateGenerated: true });
    
    res.json({ data: { eligible: totalEligible, deliberated, certified } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





















// // controllers/deliberationController.js
// const Deliberation = require('../models/Deliberation');
// const User = require('../models/User.model');
// const Notification = require('../models/Notification'); // 👈 nouveau
// // (optionnel) const emailService = require('../services/emailService');

// exports.validateDeliberation = async (req, res) => {
//   try {
//     const { studentId, remarks } = req.body;
//     const { academicYear, session } = req.query;
//     const userId = req.user._id;

//     const student = await User.findById(studentId);
//     if (!student || student.role !== 'student')
//       return res.status(404).json({ message: 'Étudiant non trouvé' });

//     const avg = student.generalAverage || 0;
//     let mention = '';
//     if (avg >= 16) mention = 'Très Bien';
//     else if (avg >= 14) mention = 'Bien';
//     else if (avg >= 12) mention = 'Assez Bien';
//     else if (avg >= 10) mention = 'Passable';
//     else mention = 'Non validé';

//     let deliberation = await Deliberation.findOne({ student: studentId, academicYear, session });
//     if (deliberation) {
//       deliberation.validated = true;
//       deliberation.validatedAt = new Date();
//       deliberation.validatedBy = userId;
//       deliberation.remarks = remarks || deliberation.remarks;
//       deliberation.mention = mention;
//     } else {
//       deliberation = new Deliberation({
//         student: studentId,
//         program: student.program,
//         academicYear,
//         session,
//         generalAverage: avg,
//         mention,
//         validated: true,
//         validatedAt: new Date(),
//         validatedBy: userId,
//         remarks
//       });
//     }
//     await deliberation.save();

//     // ----- AJOUT : Notifier l'étudiant -----
//     const resultMessage = mention === 'Non validé'
//       ? `Votre délibération pour l'année ${academicYear} (session ${session}) n'a pas été validée.`
//       : `Félicitations ! Vous avez obtenu la mention "${mention}" (moyenne ${avg}/20) pour l'année ${academicYear} (session ${session}).`;

//     // 1. Créer une notification dans la base de données
//     await Notification.create({
//       user: studentId,
//       title: mention === 'Non validé' ? 'Résultat de délibération' : 'Délibération validée',
//       message: resultMessage,
//       type: mention === 'Non validé' ? 'warning' : 'success',
//       metadata: {
//         deliberationId: deliberation._id,
//         academicYear,
//         session,
//         average: avg,
//         mention
//       }
//     });

//     // 2. (Optionnel) Envoyer un email à l'étudiant
//     // if (student.email) {
//     //   await emailService.send({
//     //     to: student.email,
//     //     subject: `Résultat de votre délibération - ${academicYear}`,
//     //     html: `<p>Bonjour ${student.firstName},</p><p>${resultMessage}</p>`
//     //   });
//     // }
//     // ----- Fin ajout -----

//     res.json({ message: 'Délibération validée et étudiant notifié', deliberation });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };