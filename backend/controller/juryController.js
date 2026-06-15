const Jury = require('../models/Jury');
const User = require('../models/User.model');
const nodemailer = require('nodemailer');

// ─── Envoi email robuste — ne throw JAMAIS ───────────────────────────────────
const sendInvitationEmail = async (teacher, session, academicYear) => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    console.log(`📧 [JURY] Config email manquante — invitation non envoyée à ${teacher.email}`);
    return { sent: false, reason: 'config_missing' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Collège Omedev" <${user}>`,
      to: teacher.email,
      subject: `Invitation jury — Session ${session} ${academicYear}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f8fafc;padding:32px;border-radius:12px">
          <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:24px;border-radius:8px;text-align:center;margin-bottom:24px">
            <h1 style="color:white;margin:0;font-size:22px">🎓 Collège Omedev</h1>
          </div>
          <h2 style="color:#1e1b4b">Invitation au jury de délibération</h2>
          <p style="color:#4b5563">Bonjour <strong>${teacher.firstName} ${teacher.lastName}</strong>,</p>
          <p style="color:#4b5563">
            Vous avez été invité(e) à participer au jury de délibération pour la
            <strong>session ${session}</strong> de l'année académique <strong>${academicYear}</strong>.
          </p>
          <p style="color:#4b5563">
            Connectez-vous à la plateforme pour consulter les détails et accéder à l'espace jury.
          </p>
          <div style="text-align:center;margin:28px 0">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login"
               style="display:inline-block;padding:14px 32px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none;font-weight:bold">
              Accéder à la plateforme
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center">
            Message automatique — merci de ne pas y répondre.
          </p>
        </div>
      `
    });

    console.log(`✅ Invitation jury envoyée à ${teacher.email}`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ Échec invitation jury (${teacher.email}):`, err.message);
    return { sent: false, reason: err.message };
  }
};

// ─── GET /api/jury ────────────────────────────────────────────────────────────
exports.getJuryMembers = async (req, res) => {
  try {
    const { academicYear, session } = req.query;
    const jury = await Jury.findOne({ academicYear, session })
      .populate('members', 'firstName lastName email role');
    res.json({ success: true, data: jury?.members || [] });
  } catch (err) {
    console.error('getJuryMembers:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/jury ────────────────────────────────────────────────────────────
exports.updateJuryMembers = async (req, res) => {
  try {
    const { academicYear, session } = req.query;
    const { memberIds } = req.body;

    if (!academicYear || !session) {
      return res.status(400).json({ success: false, message: 'academicYear et session sont requis.' });
    }

    let jury = await Jury.findOne({ academicYear, session });
    if (jury) {
      jury.members = memberIds || [];
      jury.updatedAt = new Date();
    } else {
      jury = new Jury({
        academicYear,
        session,
        members: memberIds || [],
        createdBy: req.user._id
      });
    }
    await jury.save();
    res.json({ success: true, message: 'Membres du jury mis à jour.' });
  } catch (err) {
    console.error('updateJuryMembers:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/jury/invite ────────────────────────────────────────────────────
// Ne renvoie JAMAIS 500 à cause d'un échec email
exports.inviteJuryMembers = async (req, res) => {
  try {
    const { academicYear, session, memberIds } = req.body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun membre sélectionné.' });
    }

    const teachers = await User.find({ _id: { $in: memberIds }, role: 'teacher' });

    // Envoyer les emails en parallèle — sans bloquer la réponse
    const results = await Promise.allSettled(
      teachers.map(t => sendInvitationEmail(t, session, academicYear))
    );

    const sent   = results.filter(r => r.status === 'fulfilled' && r.value.sent).length;
    const failed = results.length - sent;

    const message = failed === 0
      ? `${sent} invitation(s) envoyée(s) avec succès.`
      : sent > 0
        ? `${sent} invitation(s) envoyée(s), ${failed} échec(s) (voir logs serveur).`
        : 'Invitations enregistrées (emails non envoyés — vérifier la config SMTP).';

    res.json({ success: true, message, details: { sent, failed, total: teachers.length } });
  } catch (err) {
    console.error('inviteJuryMembers:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
