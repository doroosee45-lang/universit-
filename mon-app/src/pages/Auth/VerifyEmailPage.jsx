// // services/email.service.js
// // Ajout de la fonction sendCredentialsEmail pour les comptes créés par admin

// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT || 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// const sendEmail = async ({ to, subject, html }) => {
//   await transporter.sendMail({
//     from: `"UniManage" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html
//   });
// };

// // ─── Email de vérification ────────────────────────────────────────────────────
// const sendVerificationEmail = async (user, token) => {
//   const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
//   await sendEmail({
//     to: user.email,
//     subject: '✅ Vérifiez votre adresse email — UniManage',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
//         <h2>Bonjour ${user.firstName},</h2>
//         <p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
//         <a href="${url}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none">
//           Vérifier mon email
//         </a>
//         <p style="color:#888;margin-top:24px">Ce lien expire dans 24h.</p>
//       </div>
//     `
//   });
// };

// // ─── Email de réinitialisation ────────────────────────────────────────────────
// const sendPasswordResetEmail = async (user, token) => {
//   const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
//   await sendEmail({
//     to: user.email,
//     subject: '🔐 Réinitialisation de mot de passe — UniManage',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
//         <h2>Réinitialisation de mot de passe</h2>
//         <p>Bonjour ${user.firstName},</p>
//         <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
//         <a href="${url}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none">
//           Réinitialiser le mot de passe
//         </a>
//         <p style="color:#888;margin-top:24px">Ce lien expire dans 1 heure.</p>
//       </div>
//     `
//   });
// };

// // ─── ✅ Email identifiants (compte créé par admin) ────────────────────────────
// const sendCredentialsEmail = async (user, tempPassword, matricule) => {
//   const roleLabels = {
//     student: 'Étudiant',
//     teacher: 'Enseignant',
//     admin: 'Administrateur',
//     staff: 'Personnel',
//     super_admin: 'Super Administrateur',
//     department_head: 'Chef de département'
//   };

//   await sendEmail({
//     to: user.email,
//     subject: '🎓 Vos identifiants de connexion — UniManage',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f8fafc;padding:32px;border-radius:12px">
//         <div style="background:#4F46E5;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px">
//           <h1 style="color:white;margin:0;font-size:24px">🎓 UniManage</h1>
//           <p style="color:#c7d2fe;margin:8px 0 0">Système de Gestion Universitaire</p>
//         </div>
        
//         <h2 style="color:#1e1b4b">Bienvenue, ${user.firstName} ${user.lastName} !</h2>
//         <p style="color:#4b5563">
//           Votre compte <strong>${roleLabels[user.role] || user.role}</strong> a été créé sur UniManage.
//           Voici vos identifiants de connexion :
//         </p>

//         <div style="background:white;border:2px solid #e0e7ff;border-radius:8px;padding:20px;margin:20px 0">
//           <table style="width:100%;border-collapse:collapse">
//             <tr style="border-bottom:1px solid #f0f0f0">
//               <td style="padding:10px 0;color:#6b7280;font-weight:bold">Matricule</td>
//               <td style="padding:10px 0;color:#1e1b4b;font-weight:bold;font-size:18px">${matricule}</td>
//             </tr>
//             <tr style="border-bottom:1px solid #f0f0f0">
//               <td style="padding:10px 0;color:#6b7280;font-weight:bold">Email</td>
//               <td style="padding:10px 0;color:#1e1b4b">${user.email}</td>
//             </tr>
//             <tr>
//               <td style="padding:10px 0;color:#6b7280;font-weight:bold">Mot de passe temporaire</td>
//               <td style="padding:10px 0;color:#dc2626;font-weight:bold;font-size:18px;font-family:monospace">
//                 ${tempPassword}
//               </td>
//             </tr>
//           </table>
//         </div>

//         <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:20px">
//           <strong style="color:#92400e">⚠️ Important :</strong>
//           <p style="color:#78350f;margin:8px 0 0">
//             À votre première connexion, vous serez invité(e) à changer votre mot de passe.
//             Gardez ces identifiants confidentiels.
//           </p>
//         </div>

//         <div style="text-align:center">
//           <a href="${process.env.CLIENT_URL}/login" 
//              style="display:inline-block;padding:14px 32px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none;font-weight:bold">
//             Se connecter maintenant
//           </a>
//         </div>

//         <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px">
//           Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
//         </p>
//       </div>
//     `
//   });
// };

// module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendCredentialsEmail };

// src/pages/Auth/VerifyEmailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/services';

export default function VerifyEmailPage() {  // ✅ export default ajouté
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage('Votre email a été vérifié avec succès !');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Lien de vérification invalide ou expiré.');
      }
    };
    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Vérification en cours...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email vérifié !</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Se connecter
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Échec de vérification</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}