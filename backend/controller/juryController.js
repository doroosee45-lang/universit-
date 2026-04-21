const Jury = require('../models/Jury');
const User = require('../models/User.model');
const sendEmail = require('../utils/sendEmail');

// Obtenir les membres du jury pour une année/session
exports.getJuryMembers = async (req, res) => {
  try {
    const { academicYear, session } = req.query;
    const jury = await Jury.findOne({ academicYear, session }).populate('members', 'firstName lastName email');
    res.json({ success: true, data: jury?.members || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mettre à jour les membres du jury
exports.updateJuryMembers = async (req, res) => {
  try {
    const { academicYear, session } = req.query;
    const { memberIds } = req.body;
    let jury = await Jury.findOne({ academicYear, session });
    if (jury) {
      jury.members = memberIds;
      jury.updatedAt = new Date();
    } else {
      jury = new Jury({ academicYear, session, members: memberIds, createdBy: req.user._id });
    }
    await jury.save();
    res.json({ success: true, message: 'Membres du jury mis à jour' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Envoyer des invitations par email aux membres sélectionnés
exports.inviteJuryMembers = async (req, res) => {
  try {
    const { academicYear, session, memberIds } = req.body;
    const teachers = await User.find({ _id: { $in: memberIds }, role: 'teacher' });
    for (const teacher of teachers) {
      await sendEmail({
        to: teacher.email,
        subject: `Invitation à participer au jury - Session ${session} ${academicYear}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2>Invitation au jury de délibération</h2>
            <p>Bonjour ${teacher.firstName} ${teacher.lastName},</p>
            <p>Vous avez été invité à participer au jury de délibération pour la <strong>session ${session}</strong> de l'année académique <strong>${academicYear}</strong>.</p>
            <p>Veuillez vous connecter à la plateforme universitaire pour consulter les détails et accéder à l'espace jury.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Ceci est un message automatique, merci de ne pas y répondre.</p>
          </div>
        `
      });
    }
    res.json({ success: true, message: 'Invitations envoyées' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};