// Compatibilité : délègue au service email centralisé
const { sendEmail } = require('../services/email.service');
module.exports = sendEmail;
