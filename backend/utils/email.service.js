// services/email.service.js
// Ajout de la fonction sendCredentialsEmail pour les comptes créés par admin

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"UniManage" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

// ─── Email de vérification ────────────────────────────────────────────────────
const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail({
    to: user.email,
    subject: '✅ Vérifiez votre adresse email — UniManage',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2>Bonjour ${user.firstName},</h2>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none">
          Vérifier mon email
        </a>
        <p style="color:#888;margin-top:24px">Ce lien expire dans 24h.</p>
      </div>
    `
  });
};

// ─── Email de réinitialisation ────────────────────────────────────────────────
const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: user.email,
    subject: '🔐 Réinitialisation de mot de passe — UniManage',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Bonjour ${user.firstName},</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none">
          Réinitialiser le mot de passe
        </a>
        <p style="color:#888;margin-top:24px">Ce lien expire dans 1 heure.</p>
      </div>
    `
  });
};

// ─── ✅ Email identifiants (compte créé par admin) ────────────────────────────
const sendCredentialsEmail = async (user, tempPassword, matricule) => {
  const roleLabels = {
    student: 'Étudiant',
    teacher: 'Enseignant',
    admin: 'Administrateur',
    staff: 'Personnel',
    super_admin: 'Super Administrateur',
    department_head: 'Chef de département'
  };

  await sendEmail({
    to: user.email,
    subject: '🎓 Vos identifiants de connexion — UniManage',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f8fafc;padding:32px;border-radius:12px">
        <div style="background:#4F46E5;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px">
          <h1 style="color:white;margin:0;font-size:24px">🎓 UniManage</h1>
          <p style="color:#c7d2fe;margin:8px 0 0">Système de Gestion Universitaire</p>
        </div>
        
        <h2 style="color:#1e1b4b">Bienvenue, ${user.firstName} ${user.lastName} !</h2>
        <p style="color:#4b5563">
          Votre compte <strong>${roleLabels[user.role] || user.role}</strong> a été créé sur UniManage.
          Voici vos identifiants de connexion :
        </p>

        <div style="background:white;border:2px solid #e0e7ff;border-radius:8px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr style="border-bottom:1px solid #f0f0f0">
              <td style="padding:10px 0;color:#6b7280;font-weight:bold">Matricule</td>
              <td style="padding:10px 0;color:#1e1b4b;font-weight:bold;font-size:18px">${matricule}</td>
            </tr>
            <tr style="border-bottom:1px solid #f0f0f0">
              <td style="padding:10px 0;color:#6b7280;font-weight:bold">Email</td>
              <td style="padding:10px 0;color:#1e1b4b">${user.email}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6b7280;font-weight:bold">Mot de passe temporaire</td>
              <td style="padding:10px 0;color:#dc2626;font-weight:bold;font-size:18px;font-family:monospace">
                ${tempPassword}
              </td>
            </tr>
          </table>
        </div>

        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:20px">
          <strong style="color:#92400e">⚠️ Important :</strong>
          <p style="color:#78350f;margin:8px 0 0">
            À votre première connexion, vous serez invité(e) à changer votre mot de passe.
            Gardez ces identifiants confidentiels.
          </p>
        </div>

        <div style="text-align:center">
          <a href="${process.env.CLIENT_URL}/login" 
             style="display:inline-block;padding:14px 32px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none;font-weight:bold">
            Se connecter maintenant
          </a>
        </div>

        <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px">
          Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
        </p>
      </div>
    `
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendCredentialsEmail };
























// const nodemailer = require('nodemailer');

// const createTransporter = () => {
//   return nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//     port: parseInt(process.env.EMAIL_PORT) || 587,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     },
//     tls: { rejectUnauthorized: false }
//   });
// };

// const sendEmail = async ({ to, subject, html }) => {
//   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//     console.log('📧 [EMAIL] Config manquante — email non envoyé');
//     console.log(`   → Destinataire : ${to} | Sujet : ${subject}`);
//     return { success: true, skipped: true };
//   }

//   try {
//     const transporter = createTransporter();
//     await transporter.sendMail({
//       from: process.env.EMAIL_FROM || `"Collège Omedev" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html
//     });
//     console.log(`✅ Email envoyé à ${to}`);
//     return { success: true };
//   } catch (err) {
//     console.error('❌ Erreur envoi email:', err.message);
//     return { success: false, error: err.message };
//   }
// };

// // ─── Email de vérification standard ──────────────────────────────────────────
// const sendVerificationEmail = async (user, token) => {
//   const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
//   return sendEmail({
//     to: user.email,
//     subject: '✅ Vérifiez votre adresse email — Collège Omedev',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f8fafc;padding:32px;border-radius:12px">
//         <div style="background:#4F46E5;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px">
//           <h1 style="color:white;margin:0;font-size:22px">🎓 Collège Omedev</h1>
//           <p style="color:#c7d2fe;margin:6px 0 0;font-size:14px">Système de Gestion Universitaire</p>
//         </div>
//         <h2 style="color:#1e1b4b">Bonjour ${user.firstName},</h2>
//         <p style="color:#4b5563">Cliquez sur le bouton ci-dessous pour vérifier votre adresse email :</p>
//         <div style="text-align:center;margin:28px 0">
//           <a href="${url}" style="display:inline-block;padding:14px 32px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none;font-weight:bold">
//             Vérifier mon email
//           </a>
//         </div>
//         <p style="color:#9ca3af;font-size:12px">Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
//       </div>
//     `
//   });
// };

// // ─── Email de réinitialisation de mot de passe ───────────────────────────────
// const sendPasswordResetEmail = async (user, token) => {
//   const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
//   return sendEmail({
//     to: user.email,
//     subject: '🔐 Réinitialisation de mot de passe — Collège Omedev',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f8fafc;padding:32px;border-radius:12px">
//         <div style="background:#4F46E5;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px">
//           <h1 style="color:white;margin:0;font-size:22px">🎓 Collège Omedev</h1>
//         </div>
//         <h2 style="color:#1e1b4b">Réinitialisation de mot de passe</h2>
//         <p style="color:#4b5563">Bonjour <strong>${user.firstName}</strong>,</p>
//         <p style="color:#4b5563">Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :</p>
//         <div style="text-align:center;margin:28px 0">
//           <a href="${url}" style="display:inline-block;padding:14px 32px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none;font-weight:bold">
//             Réinitialiser mon mot de passe
//           </a>
//         </div>
//         <p style="color:#9ca3af;font-size:12px">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
//       </div>
//     `
//   });
// };

// // ─── Email d'activation de compte étudiant (créé par l'admin) ────────────────
// const sendActivationEmail = async (user, activationToken, tempPassword) => {
//   const activationUrl = `${process.env.CLIENT_URL}/activate-account/${activationToken}`;
//   const matricule = user.studentId || user.employeeId || '—';

//   return sendEmail({
//     to: user.email,
//     subject: '🎓 Activation de votre compte — Collège Omedev',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f8fafc;padding:0;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
//         <!-- Header -->
//         <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px;text-align:center">
//           <h1 style="color:white;margin:0;font-size:26px;letter-spacing:-0.5px">🎓 Collège Omedev</h1>
//           <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px">Système de Gestion Universitaire</p>
//         </div>

//         <!-- Body -->
//         <div style="padding:32px">
//           <h2 style="color:#1e1b4b;margin-top:0">Bienvenue, ${user.firstName} ${user.lastName} !</h2>
//           <p style="color:#4b5563;line-height:1.6">
//             Votre compte étudiant vient d'être créé. Voici vos identifiants de connexion provisoires :
//           </p>

//           <!-- Credentials box -->
//           <div style="background:white;border:2px solid #e0e7ff;border-radius:10px;padding:20px;margin:20px 0">
//             <table style="width:100%;border-collapse:collapse">
//               <tr style="border-bottom:1px solid #f0f0f0">
//                 <td style="padding:10px 0;color:#6b7280;font-weight:600;width:45%">Matricule</td>
//                 <td style="padding:10px 0;color:#1e1b4b;font-weight:700;font-size:17px;font-family:monospace">${matricule}</td>
//               </tr>
//               <tr style="border-bottom:1px solid #f0f0f0">
//                 <td style="padding:10px 0;color:#6b7280;font-weight:600">Email de connexion</td>
//                 <td style="padding:10px 0;color:#1e1b4b">${user.email}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 0;color:#6b7280;font-weight:600">Mot de passe temporaire</td>
//                 <td style="padding:10px 0;color:#dc2626;font-weight:700;font-size:17px;font-family:monospace">${tempPassword}</td>
//               </tr>
//             </table>
//           </div>

//           <!-- Warning -->
//           <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:24px">
//             <p style="color:#92400e;margin:0;font-size:14px">
//               <strong>⚠️ Important :</strong> Cliquez sur le bouton ci-dessous pour activer votre compte.
//               Vous serez immédiatement invité(e) à définir un mot de passe personnel sécurisé.
//               Ne partagez jamais vos identifiants.
//             </p>
//           </div>

//           <!-- CTA -->
//           <div style="text-align:center;margin:28px 0">
//             <a href="${activationUrl}"
//                style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;letter-spacing:0.3px">
//               🔐 Activer mon compte
//             </a>
//           </div>

//           <p style="color:#9ca3af;font-size:12px;text-align:center">
//             Ou copiez ce lien dans votre navigateur :<br/>
//             <span style="color:#4F46E5;font-size:11px">${activationUrl}</span>
//           </p>
//         </div>

//         <!-- Footer -->
//         <div style="background:#f1f5f9;padding:16px;text-align:center;border-top:1px solid #e2e8f0">
//           <p style="color:#9ca3af;font-size:11px;margin:0">
//             Ce lien est valable 48 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
//           </p>
//         </div>
//       </div>
//     `
//   });
// };

// module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendActivationEmail };