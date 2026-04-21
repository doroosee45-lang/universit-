const Notification = require('../models/Notification.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');


exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return successResponse(res, notifications);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true, readAt: new Date() });
    return successResponse(res, null, 'Notification lue');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true, readAt: new Date() });
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
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
    return successResponse(res, { count });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
