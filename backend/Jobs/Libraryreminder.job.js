const cron = require('node-cron');
const LibraryLoan = require('../models/LibraryLoan.model');
const notificationService = require('../services/notification.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

/**
 * Rappel de retour bibliothèque - tous les jours à 09h00
 */
const libraryReminderJob = cron.schedule('0 9 * * *', async () => {
  logger.info('[CRON] Démarrage : vérification retards bibliothèque');

  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Emprunts en retard
    const overdueLoans = await LibraryLoan.find({
      status: 'active',
      dueDate: { $lt: now },
      overdueSent: { $ne: true },
    }).populate('book', 'title author')
      .populate({
        path: 'borrower',
        populate: { path: 'user', select: 'email firstName lastName _id' },
      });

    for (const loan of overdueLoans) {
      try {
        const user = loan.borrower?.user;
        if (!user) continue;

        const daysLate = Math.floor((now - loan.dueDate) / (1000 * 60 * 60 * 24));

        await notificationService.create({
          recipient: user._id,
          type: 'library_overdue',
          title: 'Retour de livre en retard',
          message: `"${loan.book.title}" est en retard de ${daysLate} jour(s). Veuillez le retourner.`,
          priority: 'high',
        });

        await emailService.sendLibraryOverdue({
          to: user.email,
          studentName: `${user.firstName} ${user.lastName}`,
          bookTitle: loan.book.title,
          bookAuthor: loan.book.author,
          daysLate,
          dueDate: loan.dueDate,
        });

        await LibraryLoan.findByIdAndUpdate(loan._id, { overdueSent: true });
      } catch (innerErr) {
        logger.error(`[CRON] Erreur retard biblio : ${innerErr.message}`);
      }
    }

    // Rappel J-1 avant échéance
    const dueTomorrow = await LibraryLoan.find({
      status: 'active',
      dueDate: {
        $gte: new Date(now.toDateString()),
        $lt: new Date(tomorrow.toDateString()),
      },
      reminderSent: { $ne: true },
    }).populate('book', 'title author')
      .populate({
        path: 'borrower',
        populate: { path: 'user', select: 'email firstName lastName _id' },
      });

    for (const loan of dueTomorrow) {
      try {
        const user = loan.borrower?.user;
        if (!user) continue;

        await notificationService.create({
          recipient: user._id,
          type: 'library_reminder',
          title: 'Rappel : retour de livre demain',
          message: `"${loan.book.title}" doit être retourné demain.`,
        });

        await LibraryLoan.findByIdAndUpdate(loan._id, { reminderSent: true });
      } catch (innerErr) {
        logger.error(`[CRON] Erreur rappel biblio J-1 : ${innerErr.message}`);
      }
    }

    logger.info(`[CRON] ${overdueLoans.length} retards et ${dueTomorrow.length} rappels bibliothèque traités`);
  } catch (err) {
    logger.error(`[CRON] Erreur job bibliothèque : ${err.message}`);
  }
}, { timezone: 'Africa/Algiers' });

module.exports = libraryReminderJob;