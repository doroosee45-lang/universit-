const Notification = require('../models/Notification.model');
const { getIO } = require('../config/socket');

/**
 * Crée et envoie une notification à un utilisateur
 */
const sendNotification = async ({ recipient, sender, type, title, message, link }) => {
  const notification = await Notification.create({
    recipient, sender, type, title, message, link
  });

  // Envoi temps réel via Socket.io
  try {
    const io = getIO();
    io.to(`user_${recipient}`).emit('notification', {
      _id: notification._id,
      type,
      title,
      message,
      link,
      createdAt: notification.createdAt
    });
  } catch (e) {
    // Socket pas encore initialisé, pas bloquant
  }

  return notification;
};

/**
 * Envoie une notification à tous les utilisateurs d'un rôle
 */
const broadcastToRole = async ({ role, sender, type, title, message, link }) => {
  const notification = await Notification.create({
    recipientRole: role,
    sender,
    type,
    title,
    message,
    link,
    isBroadcast: true
  });

  try {
    const io = getIO();
    io.to(`role_${role}`).emit('notification', {
      _id: notification._id,
      type, title, message, link,
      createdAt: notification.createdAt
    });
  } catch (e) {}

  return notification;
};

/**
 * Envoie une notification à tous les étudiants d'une filière
 */
const broadcastToProgram = async ({ programId, sender, type, title, message }) => {
  const notification = await Notification.create({
    recipientProgram: programId,
    sender, type, title, message,
    isBroadcast: true
  });
  return notification;
};

/**
 * Marque une notification comme lue
 */
const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

/**
 * Marque toutes les notifications d'un utilisateur comme lues
 */
const markAllAsRead = async (userId) => {
  return Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

/**
 * Compte les notifications non lues
 */
const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};

module.exports = {
  sendNotification,
  broadcastToRole,
  broadcastToProgram,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};