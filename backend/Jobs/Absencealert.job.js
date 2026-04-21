const cron = require('node-cron');
const Attendance = require('../models/Attendance.model');
const Enrollment = require('../models/Enrollment.model');
const notificationService = require('../services/notification.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

const ABSENCE_THRESHOLD = 3; // Alerte après 3 absences non justifiées par cours

/**
 * Vérification hebdomadaire des absences excessives
 * Exécution : chaque lundi à 07h00
 */
const absenceAlertJob = cron.schedule('0 7 * * 1', async () => {
  logger.info('[CRON] Démarrage : vérification absences excessives');

  try {
    // Agréger les absences non justifiées par étudiant et par cours
    const absenceSummary = await Attendance.aggregate([
      { $match: { status: 'absent' } },
      {
        $group: {
          _id: { student: '$student', course: '$course' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gte: ABSENCE_THRESHOLD } } },
    ]);

    logger.info(`[CRON] ${absenceSummary.length} cas d'absences excessives trouvés`);

    for (const item of absenceSummary) {
      try {
        const enrollment = await Enrollment.findOne({
          student: item._id.student,
          status: 'enrolled',
        }).populate({
          path: 'student',
          populate: { path: 'user', select: 'email firstName lastName _id' },
        });

        if (!enrollment?.student?.user) continue;

        const { user } = enrollment.student;

        // Notifier l'étudiant
        await notificationService.create({
          recipient: user._id,
          type: 'absence_alert',
          title: 'Alerte absences',
          message: `Vous avez ${item.count} absences enregistrées. Risque de pénalité académique.`,
          priority: 'high',
        });

        // Email d'alerte
        await emailService.sendAbsenceAlert({
          to: user.email,
          studentName: `${user.firstName} ${user.lastName}`,
          absenceCount: item.count,
          courseId: item._id.course,
        });

        // Notifier les administrateurs
        await notificationService.notifyAdmins({
          type: 'absence_alert',
          title: 'Étudiant en situation d\'absences',
          message: `${user.firstName} ${user.lastName} a ${item.count} absences non justifiées.`,
          priority: 'medium',
        });
      } catch (innerErr) {
        logger.error(`[CRON] Erreur alerte absence : ${innerErr.message}`);
      }
    }
  } catch (err) {
    logger.error(`[CRON] Erreur job absences : ${err.message}`);
  }
}, { timezone: 'Africa/Algiers' });

module.exports = absenceAlertJob;