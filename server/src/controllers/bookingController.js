const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Promotion = require('../models/Promotion');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @desc    Lấy tất cả đơn đặt vé
 * @route   GET /api/bookings
 * @access  Private (Admin, Manager)
 */
exports.getAllBookings = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Booking.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const bookings = await features.query;

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: {
            bookings
        }
    });
});

/**
 * @desc    Lấy thông tin chi tiết một đơn đặt vé
 * @route   GET /api/bookings/:id
 * @access  Private (Admin, Manager, Customer - chỉ với đơn của họ)
 */
exports.getBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return next(new AppError('Không tìm thấy đơn đặt vé với ID này', 404));
    }

    // Kiểm tra quyền truy cập
    if (
        req.user.role === 'customer' &&
        booking.userId.toString() !== req.user.id.toString()
    ) {
        return next(new AppError('Bạn không có quyền truy cập đơn đặt vé này', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            booking
        }
    });
});

/**
 * @desc    Tạo đơn đặt vé mới
 * @route   POST /api/bookings
 * @access  Private
 */
exports.createBooking = catchAsync(async (req, res, next) => {
    // Lấy thông tin từ request body
    const { showtimeId, seats, promotionId } = req.body;

    // Kiểm tra suất chiếu
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
        return next(new AppError('Không tìm thấy suất chiếu với ID này', 404));
    }

    // Kiểm tra trạng thái suất chiếu
    if (showtime.status !== 'open') {
        return next(new AppError('Suất chiếu này không khả dụng', 400));
    }

    // Kiểm tra ghế đã được đặt chưa
    for (const seat of seats) {
        if (!showtime.availableSeats.includes(seat)) {
            return next(new AppError(`Ghế ${seat} không khả dụng hoặc đã được đặt`, 400));
        }
    }

    // Tính toán giá tiền
    // Giả sử tất cả ghế có cùng giá (vé thường)
    const pricePerSeat = showtime.price.regular;
    let totalAmount = pricePerSeat * seats.length;
    let discountAmount = 0;
    let finalAmount = totalAmount;

    // Xử lý khuyến mãi nếu có
    if (promotionId) {
        const promotion = await Promotion.findById(promotionId);

        if (!promotion) {
            return next(new AppError('Không tìm thấy khuyến mãi với ID này', 404));
        }

        // Kiểm tra khuyến mãi có áp dụng được không
        const orderDetails = {
            totalAmount,
            movieId: showtime.movieId,
            cinemaId: showtime.cinemaId,
            date: showtime.startTime
        };

        if (promotion.isApplicable(orderDetails)) {
            discountAmount = promotion.calculateDiscount(totalAmount);
            finalAmount = totalAmount - discountAmount;

            // Tăng số lần sử dụng khuyến mãi
            promotion.usageCount += 1;
            await promotion.save();
        } else {
            return next(new AppError('Khuyến mãi không áp dụng được cho đơn hàng này', 400));
        }
    }

    // Tạo đơn đặt vé
    const booking = await Booking.create({
        userId: req.user._id,
        showtimeId,
        movieId: showtime.movieId,
        cinemaId: showtime.cinemaId,
        hallId: showtime.hallId,
        seats,
        totalAmount,
        discount: {
            promotionId,
            amount: discountAmount
        },
        finalAmount,
        status: 'pending'
    });

    // Cập nhật trạng thái ghế (chuyển sang tạm thời đã đặt)
    // Thực tế sẽ cần một hệ thống quản lý trạng thái đặt chỗ tạm thời
    showtime.availableSeats = showtime.availableSeats.filter(
        seat => !seats.includes(seat)
    );
    await showtime.save();

    res.status(201).json({
        status: 'success',
        data: {
            booking
        }
    });
});

/**
 * @desc    Cập nhật trạng thái đơn đặt vé
 * @route   PATCH /api/bookings/:id/status
 * @access  Private (Admin, Manager)
 */
exports.updateBookingStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return next(new AppError('Trạng thái không hợp lệ', 400));
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return next(new AppError('Không tìm thấy đơn đặt vé với ID này', 404));
    }

    // Xử lý khi hủy đơn đặt vé
    if (status === 'cancelled' && booking.status !== 'cancelled') {
        // Trả lại ghế vào danh sách ghế trống
        const showtime = await Showtime.findById(booking.showtimeId);

        if (showtime && showtime.status === 'open') {
            // Thêm lại ghế vào danh sách ghế trống
            showtime.availableSeats = [...showtime.availableSeats, ...booking.seats];

            // Xóa ghế khỏi danh sách ghế đã đặt
            showtime.bookedSeats = showtime.bookedSeats.filter(
                seat => !booking.seats.includes(seat)
            );

            await showtime.save();
        }
    }

    // Cập nhật trạng thái đơn đặt vé
    booking.status = status;
    await booking.save();

    res.status(200).json({
        status: 'success',
        data: {
            booking
        }
    });
});

/**
 * @desc    Kiểm tra mã đặt vé
 * @route   GET /api/bookings/verify/:bookingCode
 * @access  Private (Admin, Manager)
 */
exports.verifyBookingCode = catchAsync(async (req, res, next) => {
    const booking = await Booking.findOne({ bookingCode: req.params.bookingCode });

    if (!booking) {
        return next(new AppError('Mã đặt vé không hợp lệ', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            booking
        }
    });
});

/**
 * @desc    Lấy tất cả đơn đặt vé của người dùng hiện tại
 * @route   GET /api/users/mybookings
 * @access  Private
 */
exports.getMyBookings = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(
        Booking.find({ userId: req.user.id }),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const bookings = await features.query;

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: {
            bookings
        }
    });
});

/**
 * @desc    Thống kê doanh thu theo ngày
 * @route   GET /api/bookings/stats/daily
 * @access  Private (Admin, Manager)
 */
exports.getDailyBookingStats = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    // Kiểm tra ngày bắt đầu và kết thúc
    if (!startDate || !endDate) {
        return next(new AppError('Vui lòng cung cấp ngày bắt đầu và kết thúc', 400));
    }

    // Chuyển đổi chuỗi ngày thành đối tượng Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return next(new AppError('Ngày không hợp lệ, vui lòng sử dụng định dạng YYYY-MM-DD', 400));
    }

    // Thống kê doanh thu theo ngày
    const stats = await Booking.aggregate([
        {
            $match: {
                bookingTime: { $gte: start, $lte: end },
                status: { $in: ['confirmed', 'completed'] }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$bookingTime' },
                    month: { $month: '$bookingTime' },
                    day: { $dayOfMonth: '$bookingTime' }
                },
                count: { $sum: 1 },
                totalRevenue: { $sum: '$finalAmount' }
            }
        },
        {
            $sort: {
                '_id.year': 1,
                '_id.month': 1,
                '_id.day': 1
            }
        }
    ]);

    // Chuyển đổi kết quả thành định dạng dễ đọc hơn
    const formattedStats = stats.map(stat => ({
        date: `${stat._id.year}-${stat._id.month}-${stat._id.day}`,
        bookings: stat.count,
        revenue: stat.totalRevenue
    }));

    res.status(200).json({
        status: 'success',
        data: {
            stats: formattedStats
        }
    });
});

/**
 * @desc    Thống kê doanh thu theo phim
 * @route   GET /api/bookings/stats/movies
 * @access  Private (Admin, Manager)
 */
exports.getMovieBookingStats = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    // Xử lý ngày bắt đầu và kết thúc tương tự như trên
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    // Thống kê doanh thu theo phim
    const stats = await Booking.aggregate([
        {
            $match: {
                bookingTime: { $gte: start, $lte: end },
                status: { $in: ['confirmed', 'completed'] }
            }
        },
        {
            $group: {
                _id: '$movieId',
                count: { $sum: 1 },
                totalRevenue: { $sum: '$finalAmount' },
                seats: { $sum: { $size: '$seats' } }
            }
        },
        {
            $sort: { totalRevenue: -1 }
        }
    ]);

    // Lấy thông tin phim
    const movieIds = stats.map(stat => stat._id);
    const movies = await Movie.find({ _id: { $in: movieIds } }, 'title');

    // Map thông tin phim vào kết quả
    const movieMap = {};
    movies.forEach(movie => {
        movieMap[movie._id] = movie.title;
    });

    const formattedStats = stats.map(stat => ({
        movieId: stat._id,
        movieTitle: movieMap[stat._id] || 'Unknown',
        bookings: stat.count,
        tickets: stat.seats,
        revenue: stat.totalRevenue
    }));

    res.status(200).json({
        status: 'success',
        data: {
            stats: formattedStats
        }
    });
});

/**
 * @desc    Thống kê doanh thu theo rạp
 * @route   GET /api/bookings/stats/cinemas
 * @access  Private (Admin, Manager)
 */
exports.getCinemaBookingStats = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    // Xử lý ngày bắt đầu và kết thúc tương tự như trên
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    // Thống kê doanh thu theo rạp
    const stats = await Booking.aggregate([
        {
            $match: {
                bookingTime: { $gte: start, $lte: end },
                status: { $in: ['confirmed', 'completed'] }
            }
        },
        {
            $group: {
                _id: '$cinemaId',
                count: { $sum: 1 },
                totalRevenue: { $sum: '$finalAmount' },
                seats: { $sum: { $size: '$seats' } }
            }
        },
        {
            $sort: { totalRevenue: -1 }
        }
    ]);

    // Lấy thông tin rạp
    const cinemaIds = stats.map(stat => stat._id);
    const cinemas = await Cinema.find({ _id: { $in: cinemaIds } }, 'name');

    // Map thông tin rạp vào kết quả
    const cinemaMap = {};
    cinemas.forEach(cinema => {
        cinemaMap[cinema._id] = cinema.name;
    });

    const formattedStats = stats.map(stat => ({
        cinemaId: stat._id,
        cinemaName: cinemaMap[stat._id] || 'Unknown',
        bookings: stat.count,
        tickets: stat.seats,
        revenue: stat.totalRevenue
    }));

    res.status(200).json({
        status: 'success',
        data: {
            stats: formattedStats
        }
    });
});