const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @desc    Lấy tất cả suất chiếu
 * @route   GET /api/showtimes
 * @access  Public
 */
exports.getAllShowtimes = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Showtime.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const showtimes = await features.query;

    const totalCount = await Showtime.countDocuments(features.queryObj);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalPages = Math.ceil(totalCount / limit);

    // Trả về kết quả
    res.status(200).json({
        status: 'success',
        data: {
            data: showtimes,
            totalCount,
            page,
            limit,
            totalPages
        }
    });

});

/**
 * @desc    Lấy thông tin chi tiết một suất chiếu
 * @route   GET /api/showtimes/:id
 * @access  Public
 */
exports.getShowtime = catchAsync(async (req, res, next) => {
    const showtime = await Showtime.findById(req.params.id);

    if (!showtime) {
        return next(new AppError('Không tìm thấy suất chiếu với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: showtime
    });
});

/**
 * @desc    Tạo suất chiếu mới
 * @route   POST /api/showtimes
 * @access  Private (Admin, Manager)
 */
exports.createShowtime = catchAsync(async (req, res, next) => {
    // Kiểm tra phim có tồn tại không
    const movie = await Movie.findById(req.body.movieId);
    if (!movie) {
        return next(new AppError('Không tìm thấy phim với ID này', 404));
    }

    // Kiểm tra rạp có tồn tại không
    const cinema = await Cinema.findById(req.body.cinemaId);
    if (!cinema) {
        return next(new AppError('Không tìm thấy rạp với ID này', 404));
    }

    // Kiểm tra phòng chiếu có tồn tại không
    const hall = cinema.halls.find(h => h.hallId === req.body.hallId);
    if (!hall) {
        return next(new AppError('Không tìm thấy phòng chiếu với ID này', 404));
    }

    // Kiểm tra thời gian chiếu có trùng lịch không
    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);

    // Kiểm tra trùng lịch suất chiếu khác
    const conflictingShowtime = await Showtime.findOne({
        cinemaId: req.body.cinemaId,
        hallId: req.body.hallId,
        $or: [
            {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime }
            }
        ],
        status: { $ne: 'canceled' }
    });

    if (conflictingShowtime) {
        return next(new AppError('Thời gian chiếu đã bị trùng với suất chiếu khác', 400));
    }

    // Tạo suất chiếu mới
    const newShowtime = await Showtime.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            showtime: newShowtime
        }
    });
});

/**
 * @desc    Cập nhật thông tin suất chiếu
 * @route   PATCH /api/showtimes/:id
 * @access  Private (Admin, Manager)
 */
exports.updateShowtime = catchAsync(async (req, res, next) => {
    // Kiểm tra nếu cập nhật thời gian chiếu
    if (req.body.startTime || req.body.endTime || req.body.hallId || req.body.cinemaId) {
        // Lấy thông tin suất chiếu hiện tại
        const currentShowtime = await Showtime.findById(req.params.id);
        if (!currentShowtime) {
            return next(new AppError('Không tìm thấy suất chiếu với ID này', 404));
        }

        // Kiểm tra nếu suất chiếu đã có người đặt vé
        if (currentShowtime.bookedSeats.length > 0) {
            return next(new AppError('Không thể cập nhật suất chiếu đã có người đặt vé', 400));
        }

        // Thời gian chiếu mới
        const startTime = new Date(req.body.startTime || currentShowtime.startTime);
        const endTime = new Date(req.body.endTime || currentShowtime.endTime);
        const cinemaId = req.body.cinemaId || currentShowtime.cinemaId;
        const hallId = req.body.hallId || currentShowtime.hallId;

        // Kiểm tra trùng lịch suất chiếu khác
        const conflictingShowtime = await Showtime.findOne({
            _id: { $ne: req.params.id },
            cinemaId,
            hallId,
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ],
            status: { $ne: 'canceled' }
        });

        if (conflictingShowtime) {
            return next(new AppError('Thời gian chiếu đã bị trùng với suất chiếu khác', 400));
        }
    }

    // Cập nhật suất chiếu
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!showtime) {
        return next(new AppError('Không tìm thấy suất chiếu với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            showtime
        }
    });
});

/**
 * @desc    Hủy suất chiếu
 * @route   PATCH /api/showtimes/:id/cancel
 * @access  Private (Admin, Manager)
 */
exports.cancelShowtime = catchAsync(async (req, res, next) => {
    const showtime = await Showtime.findById(req.params.id);

    if (!showtime) {
        return next(new AppError('Không tìm thấy suất chiếu với ID này', 404));
    }

    // Cập nhật trạng thái
    showtime.status = 'canceled';
    await showtime.save();

    // TODO: Gửi thông báo cho những người đã đặt vé

    res.status(200).json({
        status: 'success',
        data: {
            showtime
        }
    });
});

/**
 * @desc    Xóa suất chiếu
 * @route   DELETE /api/showtimes/:id
 * @access  Private (Admin, Manager)
 */
exports.deleteShowtime = catchAsync(async (req, res, next) => {
    const showtime = await Showtime.findById(req.params.id);

    if (!showtime) {
        return next(new AppError('Không tìm thấy suất chiếu với ID này', 404));
    }

    // Chỉ cho phép xóa suất chiếu chưa có người đặt vé
    if (showtime.bookedSeats.length > 0) {
        return next(new AppError('Không thể xóa suất chiếu đã có người đặt vé', 400));
    }

    await showtime.remove();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

/**
 * @desc    Lấy tất cả suất chiếu của một phim
 * @route   GET /api/movies/:movieId/showtimes
 * @access  Public
 */
exports.getShowtimesByMovie = catchAsync(async (req, res, next) => {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
        return next(new AppError('Không tìm thấy phim với ID này', 404));
    }

    // Build base query
    let baseQuery = {
        movieId: req.params.movieId,
        status: 'open'
    };

    // Date filtering logic
    const { date } = req.query;

    if (date) {
        // Filter by specific date (format: YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return next(new AppError('Định dạng ngày không hợp lệ. Sử dụng format YYYY-MM-DD', 400));
        }

        // Parse date parts to avoid timezone issues
        const [year, month, day] = date.split('-').map(Number);

        // Create dates in local timezone
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

        baseQuery.startTime = {
            $gte: startOfDay,
            $lte: endOfDay
        };
    }

    const features = new APIFeatures(
        Showtime.find(baseQuery),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const showtimes = await features.query;

    res.status(200).json({
        status: 'success',
        results: showtimes.length,
        data: showtimes
    });
});

/**
 * @desc    Lấy tất cả suất chiếu của một rạp
 * @route   GET /api/cinemas/:cinemaId/showtimes
 * @access  Public
 */
exports.getShowtimesByCinema = catchAsync(async (req, res, next) => {
    const cinema = await Cinema.findById(req.params.cinemaId);

    if (!cinema) {
        return next(new AppError('Không tìm thấy rạp với ID này', 404));
    }

    const features = new APIFeatures(
        Showtime.find({ cinemaId: req.params.cinemaId, status: 'open' }),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const showtimes = await features.query;

    res.status(200).json({
        status: 'success',
        results: showtimes.length,
        data: {
            showtimes
        }
    });
});

/**
 * @desc    Lấy tất cả suất chiếu của một ngày
 * @route   GET /api/showtimes/date/:date
 * @access  Public
 */
exports.getShowtimesByDate = catchAsync(async (req, res, next) => {
    const date = new Date(req.params.date);

    if (isNaN(date.getTime())) {
        return next(new AppError('Ngày không hợp lệ, vui lòng sử dụng định dạng YYYY-MM-DD', 400));
    }

    // Đặt thời gian bắt đầu và kết thúc của ngày
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const features = new APIFeatures(
        Showtime.find({
            startTime: { $gte: startOfDay, $lte: endOfDay },
            status: 'open'
        }),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const showtimes = await features.query;

    res.status(200).json({
        status: 'success',
        results: showtimes.length,
        data: {
            showtimes
        }
    });
});

/**
 * @desc    Lấy tất cả suất chiếu của một phim tại một rạp
 * @route   GET /api/movies/:movieId/cinemas/:cinemaId/showtimes
 * @access  Public
 */
exports.getShowtimesByMovieAndCinema = catchAsync(async (req, res, next) => {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
        return next(new AppError('Không tìm thấy phim với ID này', 404));
    }

    const cinema = await Cinema.findById(req.params.cinemaId);
    if (!cinema) {
        return next(new AppError('Không tìm thấy rạp với ID này', 404));
    }

    const features = new APIFeatures(
        Showtime.find({
            movieId: req.params.movieId,
            cinemaId: req.params.cinemaId,
            status: 'open'
        }),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const showtimes = await features.query;

    res.status(200).json({
        status: 'success',
        results: showtimes.length,
        data: {
            showtimes
        }
    });
});

/**
 * @desc    Kiểm tra trạng thái ghế của suất chiếu
 * @route   GET /api/showtimes/:id/seats
 * @access  Public
 */
exports.getShowtimeSeats = catchAsync(async (req, res, next) => {
    const showtime = await Showtime.findById(req.params.id);

    if (!showtime) {
        return next(new AppError('Không tìm thấy suất chiếu với ID này', 404));
    }

    // Lấy thông tin về cinema và hall
    const cinema = await Cinema.findById(showtime.cinemaId);
    if (!cinema) {
        return next(new AppError('Không tìm thấy rạp với ID này', 404));
    }

    const hall = cinema.halls.find(h => h.hallId === showtime.hallId);
    if (!hall) {
        return next(new AppError('Không tìm thấy phòng chiếu với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            availableSeats: showtime.availableSeats,
            bookedSeats: showtime.bookedSeats,
            seatingArrangement: hall.seatingArrangement
        }
    });
});