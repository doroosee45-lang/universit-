const cron = require('node-cron');
const Fee = require('../models/Fee.model');
const Student = require('../models/Student.model');
const notificationService = require('../services/notification.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

/**
 * Tâche quotidienne : marquer les frais en retard + envoyer rappels
 * Exécution : tous les jours à 08h00
 */
const paymentReminderJob = cron.schedule('0 8 * * *', async () => {
  logger.info('[CRON] Démarrage : vérification paiements en retard');

  try {
    const now = new Date();

    // 1. Marquer comme overdue les frais dont la date limite est dépassée
    const overdueResult = await Fee.updateMany(
      { status: 'pending', dueDate: { $lt: now } },
      { status: 'overdue' }
    );
    logger.info(`[CRON] ${overdueResult.modifiedCount} frais marqués en retard`);

    // 2. Rappel J-7 : frais qui arrivent à échéance dans 7 jours
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingFees = await Fee.find({
      status: 'pending',
      dueDate: {
        $gte: new Date(now.toDateString()),
        $lte: new Date(sevenDaysFromNow.toDateString()),
      },
      reminderSent: { $ne: true },
    }).populate({
      path: 'student',
      populate: { path: 'user', select: 'email firstName lastName' },
    });

    for (const fee of upcomingFees) {
      try {
        const student = fee.student;
        if (!student?.user?.email) continue;

        // Envoyer email de rappel
        await emailService.sendPaymentReminder({
          to: student.user.email,
          studentName: `${student.user.firstName} ${student.user.lastName}`,
          amount: fee.amount - fee.paidAmount,
          dueDate: fee.dueDate,
          feeType: fee.type,
        });

        // Notification in-app
        await notificationService.create({
          recipient: student.user._id,
          type: 'payment_reminder',
          title: 'Rappel de paiement',
          message: `Votre frais de ${fee.type} (${fee.amount - fee.paidAmount} DZD) est dû le ${fee.dueDate.toLocaleDateString('fr-FR')}`,
          link: `/fees/${fee._id}`,
        });

        // Marquer rappel envoyé
        await Fee.findByIdAndUpdate(fee._id, { reminderSent: true });
      } catch (innerErr) {
        logger.error(`[CRON] Erreur rappel étudiant ${fee.student?._id}: ${innerErr.message}`);
      }
    }

    logger.info(`[CRON] ${upcomingFees.length} rappels de paiement envoyés`);
  } catch (err) {
    logger.error(`[CRON] Erreur paiements : ${err.message}`);
  }
}, { timezone: 'Africa/Algiers' });

module.exports = paymentReminderJob;