// src/routes/verifyRoutes.js
const express = require('express');
const verifyController = require('../controllers/verifyController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Routes công khai cho việc xác thực vé (dành cho nhân viên)
router.get('/booking/:bookingId', verifyController.verifyBooking);
router.get('/booking-code/:bookingCode', verifyController.verifyBookingByCode);

// Routes cần đăng nhập
router.use(authMiddleware.protect);

// Routes chỉ dành cho Admin và Manager
router.use(authMiddleware.restrictTo('admin', 'manager'));

// Thống kê xác thực vé
router.get('/stats', verifyController.getVerificationStats);

module.exports = router;