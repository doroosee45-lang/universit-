const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  activateAccount,
  forceChangePassword,
  changePassword
} = require('../controller/Auth.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authLimiter } = require('../middleware/Ratelimit.middleware');

router.post('/register',               register);
router.post('/login',                  authLimiter, login);
router.get('/me',                      protect, getMe);
router.post('/forgot-password',        forgotPassword);
router.post('/reset-password/:token',  resetPassword);
router.get('/verify-email/:token',     verifyEmail);
router.get('/activate-account/:token', activateAccount);
router.post('/force-change-password',  protect, forceChangePassword);
router.put('/change-password',         protect, changePassword);

module.exports = router;
