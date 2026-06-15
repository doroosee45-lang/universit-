const Notification = require('../models/Notification.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');


exports.getUserNotifications = async (req, res) => {
  try {
    const { _id: userId, role, program } = req.user;

    const orClauses = [{ recipient: userId }];
    if (role)    orClauses.push({ isBroadcast: true, recipientRole: role });
    if (program) orClauses.push({ isBroadcast: true, recipientProgram: program });

    const notifications = await Notification.find({ $or: orClauses })
      .sort({ createdAt: -1 })
      .limit(60);
    return successResponse(res, notifications);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
    return successResponse(res, null, 'Notification lue');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { _id: userId, role, program } = req.user;
    const orClauses = [{ recipient: userId, isRead: false }];
    if (role)    orClauses.push({ isBroadcast: true, recipientRole: role,    isRead: false });
    if (program) orClauses.push({ isBroadcast: true, recipientProgram: program, isRead: false });
    await Notification.updateMany({ $or: orClauses }, { isRead: true, readAt: new Date() });
    return successResponse(res, null, 'Toutes les notifications lues');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Notification supprimÃ©e');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const { _id: userId, role, program } = req.user;

    const orClauses = [{ recipient: userId, isRead: false }];
    if (role)    orClauses.push({ isBroadcast: true, recipientRole: role, isRead: false });
    if (program) orClauses.push({ isBroadcast: true, recipientProgram: program, isRead: false });

    const count = await Notification.countDocuments({ $or: orClauses });
    return successResponse(res, { count });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
