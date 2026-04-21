const mongoose = require('mongoose');
const { NOTIFICATION_TYPES, ROLES } = require('../config/constants');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = tous
  recipientRole: { type: String, enum: Object.values(ROLES) }, // rôle ciblé
  recipientProgram: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    default: NOTIFICATION_TYPES.INFO
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: String, // lien interne ex: /etudiant/grades
  isRead: { type: Boolean, default: false },
  readAt: Date,
  // Pour les notifications de masse
  isBroadcast: { type: Boolean, default: false },
  expiresAt: Date
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipientRole: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);


















// const mongoose = require('mongoose');

// const notificationSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   title: { type: String, required: true },
//   message: { type: String, required: true },
//   type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
//   read: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
//   metadata: { type: mongoose.Schema.Types.Mixed }
// });

// module.exports = mongoose.model('Notification', notificationSchema);