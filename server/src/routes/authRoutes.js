const express = require('express');
const authController = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../middlewares/validate');
const {protect} = require("../middlewares/auth");

const router = express.Router();

// Đăng ký người dùng mới
router.post('/register', registerValidation, validate, authController.register);

// Đăng nhập
router.post('/login', loginValidation, validate, authController.login);

// Đăng xuất
router.get('/logout', authController.logout);

// Lấy thông tin người dùng hiện tại - cần đăng nhập
router.get('/me', protect, authController.getMe);

// Cập nhật thông tin cá nhân
router.patch('/updateme', protect, authController.updateMe);

// Cập nhật mật khẩu
router.patch('/updatepassword', protect, authController.updatePassword);

module.exports = router;