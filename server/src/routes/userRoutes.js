const express = require('express');
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Bảo vệ tất cả các routes bên dưới - yêu cầu đăng nhập
router.use(authMiddleware.protect);

// Lấy lịch sử đặt vé của người dùng hiện tại
router.get('/mybookings', bookingController.getMyBookings);

// Routes chỉ dành cho Admin
router.use(authMiddleware.restrictTo('admin'));

// Quản lý người dùng
router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

// Vô hiệu hóa / kích hoạt tài khoản
router.patch('/:id/deactivate', userController.deactivateUser);
router.patch('/:id/activate', userController.activateUser);

// Lấy lịch sử đặt vé của một người dùng
router.get('/:id/bookings', userController.getUserBookings);

// Thống kê người dùng
router.get('/stats', userController.getUserStats);

module.exports = router;