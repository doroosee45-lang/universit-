const logger = require('../utils/logger');

const initJobs = () => {
  logger.info('[CRON] Initialisation des tâches planifiées...');

  try {
    const paymentReminderJob = require('./paymentReminder.job');
    paymentReminderJob.start();
    logger.info('[CRON] ✅ Job paiements démarré (quotidien 08h00)');
  } catch (err) {
    logger.error(`[CRON] ❌ Erreur job paiements : ${err.message}`);
  }

  try {
    const absenceAlertJob = require('./absenceAlert.job');
    absenceAlertJob.start();
    logger.info('[CRON] ✅ Job absences démarré (lundi 07h00)');
  } catch (err) {
    logger.error(`[CRON] ❌ Erreur job absences : ${err.message}`);
  }

  try {
    const libraryReminderJob = require('./libraryReminder.job');
    libraryReminderJob.start();
    logger.info('[CRON] ✅ Job bibliothèque démarré (quotidien 09h00)');
  } catch (err) {
    logger.error(`[CRON] ❌ Erreur job bibliothèque : ${err.message}`);
  }

  logger.info('[CRON] Toutes les tâches planifiées sont actives');
};

module.exports = { initJobs };