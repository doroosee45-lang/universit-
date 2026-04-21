const nodemailer = require('nodemailer');

// Fonction pour envoyer un email (avec fallback si erreur)
const sendEmail = async ({ to, subject, html }) => {
  // ⚠️ MODE DÉVELOPPEMENT : Désactiver les emails
  if (process.env.NODE_ENV === 'development' || !process.env.SMTP_USER) {
    console.log('📧 [DEV MODE] Email non envoyé (mode développement)');
    console.log(`   Destinataire: ${to}`);
    console.log(`   Sujet: ${subject}`);
    return { success: true, devMode: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"${process.env.UNIVERSITY_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    
    console.log(`✅ Email envoyé à ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error.message);
    return { success: false, error: error.message };
  }
};

// Email de vérification
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  return await sendEmail({
    to: user.email,
    subject: 'Vérification de votre compte',
    html: `
      <h1>Bienvenue ${user.firstName} !</h1>
      <p>Merci de vous être inscrit. Veuillez vérifier votre email en cliquant sur le lien ci-dessous :</p>
      <a href="${verificationUrl}" style="background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:8px;">Vérifier mon compte</a>
      <p>Ou copiez ce lien : ${verificationUrl}</p>
    `
  });
};

// Email de réinitialisation mot de passe
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  return await sendEmail({
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <h1>Bonjour ${user.firstName},</h1>
      <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :</p>
      <a href="${resetUrl}" style="background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:8px;">Réinitialiser mon mot de passe</a>
      <p>Ce lien expire dans 1 heure.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };