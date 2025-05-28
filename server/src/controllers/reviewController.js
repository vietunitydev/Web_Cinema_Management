const Review = require('../models/Review');
const Movie = require('../models/Movie');
const Booking = require('../models/Booking');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @desc    Lấy tất cả đánh giá
 * @route   GET /api/reviews
 * @access  Public
 */
exports.getAllReviews = catchAsync(async (req, res, next) => {
    // Nếu có movieId trong query, lọc theo phim
    let filter = {};
    if (req.query.movieId) {
        filter = { movieId: req.query.movieId };
    }

    // Mặc định chỉ lấy các đánh giá đã duyệt
    if (!req.user || req.user.role === 'customer') {
        filter.status = 'approved';
    }

    const features = new APIFeatures(Review.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const reviews = await features.query;

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

/**
 * @desc    Lấy một đánh giá cụ thể
 * @route   GET /api/reviews/:id
 * @access  Public
 */
exports.getReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new AppError('Không tìm thấy đánh giá với ID này', 404));
    }

    // Nếu đánh giá chưa được duyệt và người dùng không phải admin/manager
    if (
        review.status !== 'approved' &&
        (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager'))
    ) {
        return next(new AppError('Đánh giá này chưa được duyệt', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});

/**
 * @desc    Tạo đánh giá mới
 * @route   POST /api/reviews
 * @access  Private
 */
exports.createReview = catchAsync(async (req, res, next) => {
    // Kiểm tra phim tồn tại
    const movie = await Movie.findById(req.body.movieId);
    if (!movie) {
        return next(new AppError('Không tìm thấy phim với ID này', 404));
    }

    // Kiểm tra xem người dùng đã xem phim chưa
    const booking = await Booking.findById(req.body.bookingId);
    if (!booking) {
        return next(new AppError('Không tìm thấy đơn đặt vé với ID này', 404));
    }

    // Kiểm tra booking có thuộc về người dùng không
    if (booking.userId._id.toString() !== req.user.id.toString()) {
        return next(new AppError('Đơn đặt vé này không thuộc về bạn', 403));
    }

    // Kiểm tra booking có thuộc về phim này không
    if (booking.movieId._id.toString() !== req.body.movieId.toString()) {
        return next(new AppError('Đơn đặt vé này không phải cho phim đã chọn', 400));
    }

    // Kiểm tra xem người dùng đã đánh giá phim này chưa
    const existingReview = await Review.findOne({
        userId: req.user.id,
        movieId: req.body.movieId
    });

    if (existingReview) {
        return next(new AppError('Bạn đã đánh giá phim này rồi', 400));
    }

    // Tạo đánh giá mới
    const newReview = await Review.create({
        ...req.body,
        userId: req.user.id,
        status: 'pending' // Đánh giá cần được duyệt trước khi hiển thị
    });

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});

/**
 * @desc    Cập nhật đánh giá
 * @route   PATCH /api/reviews/:id
 * @access  Private
 */
exports.updateReview = catchAsync(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new AppError('Không tìm thấy đánh giá với ID này', 404));
    }

    // Kiểm tra xem người dùng có quyền cập nhật đánh giá không
    if (
        req.user.role === 'customer' &&
        review.userId.toString() !== req.user.id.toString()
    ) {
        return next(new AppError('Bạn không có quyền cập nhật đánh giá này', 403));
    }

    // Admin và Manager có thể cập nhật trạng thái
    if (['admin', 'manager'].includes(req.user.role)) {
        // Nếu cập nhật status thành 'approved', cập nhật rating của phim
        if (req.body.status && req.body.status === 'approved' && review.status !== 'approved') {
            // Rating sẽ được tự động cập nhật thông qua post middleware
        }
    } else {
        // Khách hàng chỉ có thể cập nhật nội dung và rating
        req.body = {
            rating: req.body.rating,
            title: req.body.title,
            content: req.body.content
        };

        // Đặt lại trạng thái thành pending khi khách hàng cập nhật
        req.body.status = 'pending';
    }

    // Cập nhật đánh giá
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});

/**
 * @desc    Xóa đánh giá
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new AppError('Không tìm thấy đánh giá với ID này', 404));
    }

    // Kiểm tra xem người dùng có quyền xóa đánh giá không
    if (
        req.user.role === 'customer' &&
        review.userId.toString() !== req.user.id.toString()
    ) {
        return next(new AppError('Bạn không có quyền xóa đánh giá này', 403));
    }

    await review.remove();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

/**
 * @desc    Duyệt đánh giá
 * @route   PATCH /api/reviews/:id/approve
 * @access  Private (Admin, Manager)
 */
exports.approveReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new AppError('Không tìm thấy đánh giá với ID này', 404));
    }

    // Cập nhật trạng thái
    review.status = 'approved';
    await review.save();

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});

/**
 * @desc    Từ chối đánh giá
 * @route   PATCH /api/reviews/:id/reject
 * @access  Private (Admin, Manager)
 */
exports.rejectReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new AppError('Không tìm thấy đánh giá với ID này', 404));
    }

    // Cập nhật trạng thái
    review.status = 'rejected';
    await review.save();

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});

/**
 * @desc    Lấy đánh giá của người dùng hiện tại
 * @route   GET /api/reviews/myreviews
 * @access  Private
 */
exports.getMyReviews = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(
        Review.find({ userId: req.user.id }),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const reviews = await features.query;

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

/**
 * @desc    Lấy tất cả đánh giá đang chờ duyệt
 * @route   GET /api/reviews/pending
 * @access  Private (Admin, Manager)
 */
exports.getPendingReviews = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(
        Review.find({ status: 'pending' }),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const reviews = await features.query;

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});