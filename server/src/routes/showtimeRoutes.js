const express = require('express');
const showtimeController = require('../controllers/showtimeController');
const authMiddleware = require('../middlewares/auth');
const { showtimeValidation, validate } = require('../middlewares/validate');
const {isLoggedIn} = require("../middlewares/auth");

const router = express.Router();

// Routes công khai
router.get('/', isLoggedIn, showtimeController.getAllShowtimes);
router.get('/date/:date', showtimeController.getShowtimesByDate);
router.get('/:id', showtimeController.getShowtime);
router.get('/:id/seats', showtimeController.getShowtimeSeats);

// Routes cần đăng nhập
router.use(authMiddleware.protect);

// Routes chỉ dành cho Admin và Manager
router.use(authMiddleware.restrictTo('admin', 'manager'));

// Quản lý suất chiếu
router.route('/')
    .post(showtimeValidation, validate, showtimeController.createShowtime);

router.route('/:id')
    .patch(showtimeController.updateShowtime)
    .delete(showtimeController.deleteShowtime);

// Hủy suất chiếu
router.patch('/:id/cancel', showtimeController.cancelShowtime);

module.exports = router;