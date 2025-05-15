const express = require('express');
const cinemaController = require('../controllers/cinemaController');
const showtimeController = require('../controllers/showtimeController');
const authMiddleware = require('../middlewares/auth');
const { cinemaValidation, hallValidation, validate } = require('../middlewares/validate');
const {isLoggedIn} = require("../middlewares/auth");

const router = express.Router();

// Routes công khai
router.get('/', isLoggedIn, cinemaController.getAllCinemas);
router.get('/city/:city', cinemaController.getCinemasByCity);
router.get('/:id', cinemaController.getCinema);
router.get('/:id/halls', cinemaController.getCinemaHalls);
router.get('/:id/halls/:hallId', cinemaController.getCinemaHall);

// Lấy tất cả suất chiếu của một rạp
router.get('/:cinemaId/showtimes', showtimeController.getShowtimesByCinema);

// Routes cần đăng nhập
router.use(authMiddleware.protect);

// Routes chỉ dành cho Admin và Manager
router.use(authMiddleware.restrictTo('admin', 'manager'));

// Quản lý rạp
router.route('/')
    .post(cinemaValidation, validate, cinemaController.createCinema);

router.route('/:id')
    .patch(cinemaController.updateCinema)
    .delete(cinemaController.deleteCinema);

// Quản lý phòng chiếu
router.route('/:id/halls')
    .post(hallValidation, validate, cinemaController.addCinemaHall);

router.route('/:id/halls/:hallId')
    .patch(cinemaController.updateCinemaHall)
    .delete(cinemaController.deleteCinemaHall);

module.exports = router;