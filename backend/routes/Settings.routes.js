const express = require('express');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');
const settingsCtrl = require('../controller/Settings.controller');
const notifCtrl = require('../controller/Notification.controller');

// ─── Settings Router ───────────────────────────────────────────────────────────
const settingsRouter = express.Router();

// Toutes les routes settings nécessitent d'être connecté
settingsRouter.use(protect);

// GET  /api/settings         → accessible à tous les utilisateurs connectés
settingsRouter.get('/', settingsCtrl.getSettings);

// PUT  /api/settings         → réservé à l'admin
settingsRouter.put('/', authorize('admin'), settingsCtrl.updateSettings);

// PUT  /api/settings/academic-year → réservé à l'admin
// ⚠️ Cette route doit être AVANT toute route avec :id pour éviter les conflits
settingsRouter.put('/academic-year', authorize('admin'), settingsCtrl.updateAcademicYear);

// ─── Notification Router ───────────────────────────────────────────────────────
const notifRouter = express.Router();

// Toutes les routes notifications nécessitent d'être connecté
notifRouter.use(protect);

notifRouter.get('/', notifCtrl.getUserNotifications);
notifRouter.get('/unread-count', notifCtrl.getUnreadCount);
notifRouter.put('/mark-all-read', notifCtrl.markAllAsRead);
notifRouter.put('/:id/read', notifCtrl.markAsRead);
notifRouter.delete('/:id', notifCtrl.deleteNotification);

module.exports = { settingsRouter, notifRouter };