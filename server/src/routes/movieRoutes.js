const express = require('express');
const movieController = require('../controllers/movieController');
const showtimeController = require('../controllers/showtimeController');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/auth');
const uploadMiddleware = require('../middlewares/upload');
const { movieValidation, validate } = require('../middlewares/validate');

const router = express.Router();

// Routes công khai
router.get('/', movieController.getAllMovies);
router.get('/now-playing', movieController.getNowPlaying);
router.get('/coming-soon', movieController.getComingSoon);
router.get('/top-rated', movieController.getTopRated);
router.get('/search', movieController.searchMovies);
router.get('/:id', movieController.getMovie);

// Lấy tất cả suất chiếu của một phim
router.get('/:movieId/showtimes', showtimeController.getShowtimesByMovie);

// Lấy tất cả suất chiếu của một phim tại một rạp
router.get('/:movieId/cinemas/:cinemaId/showtimes', showtimeController.getShowtimesByMovieAndCinema);

// Routes cần đăng nhập
router.use(authMiddleware.protect);

// Routes chỉ dành cho Admin và Manager
router.use(authMiddleware.restrictTo('admin', 'manager'));

// Get movie options for dropdowns
router.get('/options', movieController.getMovieOptions);

// Movie creation routes
router.post('/',
    movieValidation,
    validate,
    movieController.createMovie
);

router.post('/with-file',
    uploadMiddleware.uploadMovieImages,
    uploadMiddleware.processMovieImages,
    uploadMiddleware.handleMulterError,
    movieValidation,
    validate,
    movieController.createMovieWithFile
);

// Movie update routes
router.patch('/:id',
    movieController.updateMovie
);

router.patch('/:id/with-file',
    uploadMiddleware.uploadMovieImages,
    uploadMiddleware.processMovieImages,
    uploadMiddleware.handleMulterError,
    movieController.updateMovieWithFile
);

// Movie deletion
router.delete('/:id', movieController.deleteMovie);

module.exports = router;