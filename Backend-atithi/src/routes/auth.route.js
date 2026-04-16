
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/send-otp', authController.sendOtpController);
router.post('/verify-otp', authController.verifyOtpController);

module.exports = router;
