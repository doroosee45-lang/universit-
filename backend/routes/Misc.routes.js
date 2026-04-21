const express = require('express');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');
const settingsCtrl = require('../controller/Settings.controller');
const notifCtrl = require('../controller/Notification.controller');

const settingsRouter = express.Router();
settingsRouter.use(protect);
settingsRouter.get('/', settingsCtrl.getSettings);
settingsRouter.put('/', authorize('admin'), settingsCtrl.updateSettings);
settingsRouter.put('/academic-year', authorize('admin'), settingsCtrl.updateAcademicYear);

const notifRouter = express.Router();
notifRouter.use(protect);
notifRouter.get('/', notifCtrl.getUserNotifications);
notifRouter.get('/unread-count', notifCtrl.getUnreadCount);
notifRouter.put('/mark-all-read', notifCtrl.markAllAsRead);
notifRouter.put('/:id/read', notifCtrl.markAsRead);
notifRouter.delete('/:id', notifCtrl.deleteNotification);

module.exports = { settingsRouter, notifRouter };