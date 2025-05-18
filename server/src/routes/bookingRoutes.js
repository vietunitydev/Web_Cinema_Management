const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/auth');
const { bookingValidation, validate } = require('../middlewares/validate');

const router = express.Router();

// Routes cần đăng nhập
router.use(authMiddleware.protect);

// Tạo đơn đặt vé mới
router.post('/', bookingValidation, validate, bookingController.createBooking);

// Lấy đơn đặt vé của bản thân (route này được dùng tại userRoutes)
// router.get('/mybookings', bookingController.getMyBookings);

router.route('/:id')
    .get(bookingController.getBooking);

// Routes cho Admin và Manager
router.use(authMiddleware.restrictTo('admin', 'manager'));

// Kiểm tra mã đặt vé
router.get('/verify/:bookingCode', bookingController.verifyBookingCode);

// Thống kê đặt vé
router.get('/stats/daily', bookingController.getDailyBookingStats);
router.get('/stats/movies', bookingController.getMovieBookingStats);
router.get('/stats/cinemas', bookingController.getCinemaBookingStats);

// Quản lý đơn đặt vé
router.route('/')
    .get(bookingController.getAllBookings);
//
// router.route('/:id')
//     .get(bookingController.getBooking);

// Cập nhật trạng thái đơn đặt vé
router.patch('/:id/status', bookingController.updateBookingStatus);

module.exports = router;