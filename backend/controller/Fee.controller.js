// const Fee = require('../models/Fee.model');
// const Payment = require('../models/Payment.model');
// const { success, created, notFound, paginated, badRequest } = require('../utils/apiResponse');
// const { getPagination, getCurrentAcademicYear } = require('../utils/helpers');
// const { generateReceiptPDF } = require('../services/pdf.service');
// const { sendPaymentReminder } = require('../services/email.service');

// // GET /api/fees
// const getFees = async (req, res, next) => {
//   try {
//     const { page, limit, skip } = getPagination(req.query);
//     let filter = {};

//     if (req.user.role === 'student') {
//       filter.student = req.user._id;
//     } else {
//       if (req.query.student)      filter.student      = req.query.student;
//       if (req.query.status)       filter.status       = req.query.status;
//       if (req.query.academicYear) filter.academicYear = req.query.academicYear;
//       if (req.query.level)        filter.level        = req.query.level;
//       if (req.query.program)      filter.program      = req.query.program;
//     }

//     const [fees, total] = await Promise.all([
//       Fee.find(filter)
//         .populate('student', 'firstName lastName studentId email level program option')
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//       Fee.countDocuments(filter),
//     ]);

//     return paginated(res, fees, total, page, limit);
//   } catch (err) {
//     next(err);
//   }
// };

// // POST /api/fees  — Créer une fiche de frais (individuelle ou en masse)
// const createFee = async (req, res, next) => {
//   try {
//     const {
//       student,          // ID étudiant (ajout individuel)
//       academicYear,
//       items,            // tableau [{category, label, amount, dueDate}] — optionnel
//       amount,           // montant global — utilisé si items absent
//       feeType,          // type de frais — utilisé si items absent
//       dueDate,
//       description,
//       // Cible de masse
//       target,           // 'all' | 'program' | 'level' | 'option'
//       programId,
//       level,
//       option,
//     } = req.body;

//     const year = academicYear || getCurrentAcademicYear();

//     // ── Construire le tableau items ────────────────────────────────────────────
//     const buildItems = () => {
//       // Si items fourni directement (tableau valide)
//       if (Array.isArray(items) && items.length > 0) {
//         return items.map(i => ({
//           category : i.category || 'autre',
//           label    : i.label    || i.category || 'Frais',
//           amount   : Number(i.amount) || 0,
//           dueDate  : i.dueDate || dueDate || undefined,
//           isPaid   : false,
//         }));
//       }

//       // Sinon construire un item unique à partir de amount + feeType
//       if (amount !== undefined) {
//         const categoryMap = {
//           tuition      : 'scolarite',
//           inscription  : 'inscription',
//           bibliotheque : 'bibliotheque',
//           laboratoire  : 'laboratoire',
//           sport        : 'autre',
//           autre        : 'autre',
//         };
//         return [{
//           category : categoryMap[feeType] || 'autre',
//           label    : description || feeType || 'Frais de scolarité',
//           amount   : Number(amount),
//           dueDate  : dueDate || undefined,
//           isPaid   : false,
//         }];
//       }

//       return null; // erreur
//     };

//     const builtItems = buildItems();
//     if (!builtItems || builtItems.length === 0) {
//       return badRequest(res, 'Veuillez fournir au moins un frais (items ou amount).');
//     }

//     const totalAmount = builtItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
//     if (totalAmount <= 0) {
//       return badRequest(res, 'Le montant total doit être supérieur à 0.');
//     }

//     // ── Ajout individuel ───────────────────────────────────────────────────────
//     if (student) {
//       const existing = await Fee.findOne({ student, academicYear: year });
//       if (existing) {
//         return badRequest(res, 'Une fiche de frais existe déjà pour cet étudiant cette année.');
//       }
//       const fee = await Fee.create({ student, academicYear: year, items: builtItems, totalAmount });
//       return created(res, fee, 'Fiche de frais créée.');
//     }

//     // ── Ajout en masse ─────────────────────────────────────────────────────────
//     const User = require('../models/User.model');
//     let userFilter = { role: 'student' };

//     if (target === 'program' && programId) userFilter.program = programId;
//     if (target === 'level'   && level)     userFilter.level   = level;
//     if (target === 'option'  && option)    userFilter.option  = option;

//     const students = await User.find(userFilter).select('_id');
//     if (!students.length) {
//       return badRequest(res, 'Aucun étudiant trouvé pour cette cible.');
//     }

//     let created_count = 0;
//     let skipped_count = 0;

//     for (const s of students) {
//       const existing = await Fee.findOne({ student: s._id, academicYear: year });
//       if (existing) { skipped_count++; continue; }

//       await Fee.create({
//         student     : s._id,
//         academicYear: year,
//         items       : builtItems,
//         totalAmount,
//       });
//       created_count++;
//     }

//     return created(res, { created: created_count, skipped: skipped_count },
//       `${created_count} fiche(s) créée(s), ${skipped_count} ignorée(s).`);
//   } catch (err) {
//     next(err);
//   }
// };

// // POST /api/fees/:id/pay  — Enregistrer un paiement
// const recordPayment = async (req, res, next) => {
//   try {
//     const { amount, method, reference } = req.body;
//     const fee = await Fee.findById(req.params.id).populate('student');
//     if (!fee) return notFound(res, 'Fiche de frais introuvable.');

//     const payAmount = Number(amount);
//     if (!payAmount || payAmount <= 0) {
//       return badRequest(res, 'Montant invalide.');
//     }
//     if (payAmount > fee.remainingAmount) {
//       return badRequest(res, `Le montant dépasse le restant dû (${fee.remainingAmount} DA).`);
//     }

//     const receiptNumber = `REC-${Date.now()}`;

//     const payment = await Payment.create({
//       fee         : fee._id,
//       student     : fee.student._id,
//       amount      : payAmount,
//       method,
//       reference,
//       receiptNumber,
//       recordedBy  : req.user._id,
//     });

//     fee.paidAmount      += payAmount;
//     fee.lastPaymentDate  = new Date();
//     await fee.save();

//     // Générer le reçu PDF (ne bloque pas la réponse si erreur)
//     try {
//       await generateReceiptPDF({ student: fee.student, payment, fee, receiptNumber });
//       payment.receiptUrl = `/uploads/reports/${receiptNumber}.pdf`;
//       await payment.save();
//     } catch (_) { /* PDF non bloquant */ }

//     return success(res, {
//       payment,
//       fee: {
//         totalAmount    : fee.totalAmount,
//         paidAmount     : fee.paidAmount,
//         remainingAmount: fee.remainingAmount,
//         status         : fee.status,
//       },
//     }, 'Paiement enregistré.');
//   } catch (err) {
//     next(err);
//   }
// };

// // GET /api/fees/:id/history  — Historique paiements
// const getPaymentHistory = async (req, res, next) => {
//   try {
//     const payments = await Payment.find({ fee: req.params.id })
//       .populate('recordedBy', 'firstName lastName')
//       .sort({ paymentDate: -1 });
//     return success(res, payments);
//   } catch (err) {
//     next(err);
//   }
// };

// // GET /api/fees/:feeId/receipt/:paymentId/pdf
// const downloadReceipt = async (req, res, next) => {
//   try {
//     const payment = await Payment.findById(req.params.paymentId);
//     const fee     = await Fee.findById(req.params.feeId).populate('student');
//     if (!payment || !fee) return notFound(res, 'Paiement introuvable.');

//     const pdf = await generateReceiptPDF({
//       student      : fee.student,
//       payment,
//       fee,
//       receiptNumber: payment.receiptNumber,
//     });
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=recu_${payment.receiptNumber}.pdf`);
//     res.send(pdf);
//   } catch (err) {
//     next(err);
//   }
// };

// // POST /api/fees/reminders  — Envoyer rappels
// const sendReminders = async (req, res, next) => {
//   try {
//     const { target, programId, level, option } = req.body;

//     let filter = { status: { $in: ['pending', 'partial', 'overdue'] } };
//     // On filtre via les étudiants si target spécifique
//     if (target && target !== 'all') {
//       const User = require('../models/User.model');
//       let userFilter = { role: 'student' };
//       if (target === 'program' && programId) userFilter.program = programId;
//       if (target === 'level'   && level)     userFilter.level   = level;
//       if (target === 'option'  && option)    userFilter.option  = option;
//       const students = await User.find(userFilter).select('_id');
//       filter.student = { $in: students.map(s => s._id) };
//     }

//     const overdueFees = await Fee.find(filter).populate('student');
//     let sent = 0;
//     for (const fee of overdueFees) {
//       if (fee.student?.email) {
//         await sendPaymentReminder(fee.student, fee);
//         sent++;
//       }
//     }
//     return success(res, { sent }, `${sent} rappel(s) envoyé(s).`);
//   } catch (err) {
//     next(err);
//   }
// };

// // GET /api/fees/stats  — Statistiques financières
// const getFinancialStats = async (req, res, next) => {
//   try {
//     const { academicYear } = req.query;
//     const filter = academicYear ? { academicYear } : {};

//     const [stats, totals] = await Promise.all([
//       Fee.aggregate([
//         { $match: filter },
//         {
//           $group: {
//             _id            : '$status',
//             count          : { $sum: 1 },
//             totalAmount    : { $sum: '$totalAmount' },
//             paidAmount     : { $sum: '$paidAmount' },
//             remainingAmount: { $sum: '$remainingAmount' },
//           },
//         },
//       ]),
//       Fee.aggregate([
//         { $match: filter },
//         {
//           $group: {
//             _id           : null,
//             totalRevenue  : { $sum: '$totalAmount' },
//             totalCollected: { $sum: '$paidAmount' },
//             totalPending  : { $sum: '$remainingAmount' },
//           },
//         },
//       ]),
//     ]);

//     return success(res, { stats, totals: totals[0] || {} });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = {
//   getFees,
//   createFee,
//   recordPayment,
//   getPaymentHistory,
//   downloadReceipt,
//   sendReminders,
//   getFinancialStats,
// };



const Fee     = require('../models/Fee.model');
const Payment = require('../models/Payment.model');
const {
  success, created, notFound, paginated, badRequest, forbidden,
} = require('../utils/apiResponse');
const { getPagination, getCurrentAcademicYear } = require('../utils/helpers');

// ─── Helpers ──────────────────────────────────────────────────────────────────
let generateReceiptPDF = async () => null;
let sendPaymentReminder = async () => null;
try { generateReceiptPDF  = require('../services/pdf.service').generateReceiptPDF;   } catch (_) {}
try { sendPaymentReminder = require('../services/email.service').sendPaymentReminder; } catch (_) {}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/fees
// • admin / staff → tous les frais (avec filtres)
// • student       → uniquement SES frais (le filtre ?student= est ignoré)
// ─────────────────────────────────────────────────────────────────────────────
const getFees = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    let filter = {};

    if (req.user.role === 'student') {
      // ✅ Un étudiant ne peut voir QUE ses propres frais
      filter.student = req.user._id;
    } else {
      // Admin / staff : filtres libres
      if (req.query.student)      filter.student      = req.query.student;
      if (req.query.status)       filter.status       = req.query.status;
      if (req.query.academicYear) filter.academicYear = req.query.academicYear;
      if (req.query.level)        filter.level        = req.query.level;
      if (req.query.program)      filter.program      = req.query.program;

      // Recherche textuelle sur l'étudiant (via populate + $lookup en MongoDB)
      // Pour simplifier, on le gère côté tri/populate ci-dessous
    }

    const [fees, total] = await Promise.all([
      Fee.find(filter)
        .populate('student', 'firstName lastName studentId email level program')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Fee.countDocuments(filter),
    ]);

    return paginated(res, fees, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/fees  — Créer une fiche (individuelle ou en masse)
// ─────────────────────────────────────────────────────────────────────────────
const createFee = async (req, res, next) => {
  try {
    const {
      student, academicYear, items, amount, feeType,
      dueDate, description,
      target, programId, level, option,
    } = req.body;

    const year = academicYear || getCurrentAcademicYear();

    // ── Construire les items ──────────────────────────────────────────────────
    const buildItems = () => {
      if (Array.isArray(items) && items.length > 0) {
        return items.map(i => ({
          category : i.category || 'autre',
          label    : i.label || i.category || 'Frais',
          amount   : Number(i.amount) || 0,
          dueDate  : i.dueDate || dueDate || undefined,
          isPaid   : false,
        }));
      }
      if (amount !== undefined) {
        const categoryMap = {
          tuition: 'scolarite', inscription: 'inscription',
          bibliotheque: 'bibliotheque', laboratoire: 'laboratoire',
          sport: 'autre', autre: 'autre',
        };
        return [{
          category : categoryMap[feeType] || 'autre',
          label    : description || feeType || 'Frais de scolarité',
          amount   : Number(amount),
          dueDate  : dueDate || undefined,
          isPaid   : false,
        }];
      }
      return null;
    };

    const builtItems = buildItems();
    if (!builtItems || builtItems.length === 0) {
      return badRequest(res, 'Veuillez fournir au moins un frais (items ou amount).');
    }

    const totalAmount = builtItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    if (totalAmount <= 0) return badRequest(res, 'Le montant total doit être > 0.');

    // ── Ajout individuel ──────────────────────────────────────────────────────
    if (student) {
      const existing = await Fee.findOne({ student, academicYear: year });
      if (existing) {
        return badRequest(res, 'Une fiche existe déjà pour cet étudiant cette année.');
      }
      const fee = await Fee.create({ student, academicYear: year, items: builtItems, totalAmount });
      return created(res, fee, 'Fiche créée.');
    }

    // ── Ajout en masse ────────────────────────────────────────────────────────
    const User = require('../models/User.model');
    let userFilter = { role: 'student', status: 'active' };
    if (target === 'program' && programId) userFilter.program = programId;
    if (target === 'level'   && level)     userFilter.level   = level;
    if (target === 'option'  && option)    userFilter.option  = option;

    const students = await User.find(userFilter).select('_id');
    if (!students.length) return badRequest(res, 'Aucun étudiant trouvé.');

    let created_count = 0, skipped_count = 0;
    for (const s of students) {
      const existing = await Fee.findOne({ student: s._id, academicYear: year });
      if (existing) { skipped_count++; continue; }
      await Fee.create({ student: s._id, academicYear: year, items: builtItems, totalAmount });
      created_count++;
    }

    return created(res, { created: created_count, skipped: skipped_count },
      `${created_count} fiche(s) créée(s), ${skipped_count} ignorée(s).`);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/fees/:id/pay  — Enregistrer un paiement
// ─────────────────────────────────────────────────────────────────────────────
const recordPayment = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('student');
    if (!fee) return notFound(res, 'Fiche introuvable.');

    // ✅ Un étudiant ne peut payer que ses propres frais
    if (req.user.role === 'student' &&
        fee.student._id.toString() !== req.user._id.toString()) {
      return forbidden(res, 'Accès refusé.');
    }

    const { amount, method, reference } = req.body;
    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) return badRequest(res, 'Montant invalide.');
    if (payAmount > fee.remainingAmount) {
      return badRequest(res, `Dépasse le restant dû (${fee.remainingAmount} DA).`);
    }

    const receiptNumber = `REC-${Date.now()}`;
    const payment = await Payment.create({
      fee          : fee._id,
      student      : fee.student._id,
      amount       : payAmount,
      method       : method || 'cash',
      reference    : reference || undefined,
      receiptNumber,
      recordedBy   : req.user._id,
    });

    fee.paidAmount     += payAmount;
    fee.lastPaymentDate = new Date();
    await fee.save();

    // PDF reçu (non bloquant)
    try {
      await generateReceiptPDF({ student: fee.student, payment, fee, receiptNumber });
      payment.receiptUrl = `/uploads/reports/${receiptNumber}.pdf`;
      await payment.save();
    } catch (_) {}

    return success(res, {
      payment,
      fee: {
        totalAmount    : fee.totalAmount,
        paidAmount     : fee.paidAmount,
        remainingAmount: fee.remainingAmount,
        status         : fee.status,
      },
    }, 'Paiement enregistré.');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/fees/:id/status  — Changer le statut (admin/staff)
// ─────────────────────────────────────────────────────────────────────────────
const updateFeeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['paid', 'pending', 'partial', 'overdue', 'inactive'];
    if (!allowed.includes(status)) return badRequest(res, 'Statut invalide.');

    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('student', 'firstName lastName studentId');

    if (!fee) return notFound(res, 'Fiche introuvable.');
    return success(res, fee, 'Statut mis à jour.');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/fees/:id  — Supprimer (admin)
// ─────────────────────────────────────────────────────────────────────────────
const deleteFee = async (req, res, next) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return notFound(res, 'Fiche introuvable.');
    // Supprimer aussi les paiements liés
    await Payment.deleteMany({ fee: req.params.id });
    return success(res, null, 'Fiche supprimée.');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/fees/:id/history
// ─────────────────────────────────────────────────────────────────────────────
const getPaymentHistory = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return notFound(res, 'Fiche introuvable.');

    // Vérif accès étudiant
    if (req.user.role === 'student' &&
        fee.student.toString() !== req.user._id.toString()) {
      return forbidden(res, 'Accès refusé.');
    }

    const payments = await Payment.find({ fee: req.params.id })
      .populate('recordedBy', 'firstName lastName')
      .sort({ paymentDate: -1 });

    return success(res, payments);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/fees/:feeId/receipt/:paymentId/pdf
// ─────────────────────────────────────────────────────────────────────────────
const downloadReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    const fee     = await Fee.findById(req.params.feeId || req.params.id).populate('student');
    if (!payment || !fee) return notFound(res, 'Paiement introuvable.');

    if (req.user.role === 'student' &&
        fee.student._id.toString() !== req.user._id.toString()) {
      return forbidden(res, 'Accès refusé.');
    }

    const pdf = await generateReceiptPDF({
      student      : fee.student,
      payment,
      fee,
      receiptNumber: payment.receiptNumber,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=recu_${payment.receiptNumber}.pdf`);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/fees/reminders
// ─────────────────────────────────────────────────────────────────────────────
const sendReminders = async (req, res, next) => {
  try {
    const { target, programId, level, option } = req.body;
    let filter = { status: { $in: ['pending', 'partial', 'overdue'] } };

    if (target && target !== 'all') {
      const User = require('../models/User.model');
      let userFilter = { role: 'student' };
      if (target === 'program' && programId) userFilter.program = programId;
      if (target === 'level'   && level)     userFilter.level   = level;
      if (target === 'option'  && option)    userFilter.option  = option;
      const students = await User.find(userFilter).select('_id');
      filter.student = { $in: students.map(s => s._id) };
    }

    const overdueFees = await Fee.find(filter).populate('student');
    let sent = 0;
    for (const fee of overdueFees) {
      if (fee.student?.email) { await sendPaymentReminder(fee.student, fee); sent++; }
    }
    return success(res, { sent }, `${sent} rappel(s) envoyé(s).`);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/fees/stats
// ─────────────────────────────────────────────────────────────────────────────
const getFinancialStats = async (req, res, next) => {
  try {
    const { academicYear } = req.query;
    const filter = academicYear ? { academicYear } : {};

    const [stats, totals] = await Promise.all([
      Fee.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' }, paidAmount: { $sum: '$paidAmount' }, remainingAmount: { $sum: '$remainingAmount' } } },
      ]),
      Fee.aggregate([
        { $match: filter },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalCollected: { $sum: '$paidAmount' }, totalPending: { $sum: '$remainingAmount' } } },
      ]),
    ]);

    return success(res, { stats, totals: totals[0] || {} });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFees, createFee, recordPayment,
  updateFeeStatus, deleteFee,
  getPaymentHistory, downloadReceipt,
  sendReminders, getFinancialStats,
};