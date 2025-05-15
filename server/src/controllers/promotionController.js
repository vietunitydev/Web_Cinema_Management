const Promotion = require('../models/Promotion');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @desc    Lấy tất cả khuyến mãi
 * @route   GET /api/promotions
 * @access  Public
 */
exports.getAllPromotions = catchAsync(async (req, res, next) => {
    // Mặc định chỉ lấy các khuyến mãi đang active
    let filter = {};

    // Nếu là admin hoặc manager, hiển thị tất cả
    if (req.user && ['admin', 'manager'].includes(req.user.role)) {
        if (req.query.status) {
            filter.status = req.query.status;
        }
    } else {
        filter.status = 'active';
    }

    // console.log(req.user.role)

    const features = new APIFeatures(Promotion.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const data = await features.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalCount = await Promotion.countDocuments(features.queryObj);
    const totalPages = Math.ceil(totalCount / limit);

    // Trả về kết quả
    res.status(200).json({
        status: 'success',
        data: {
            data,
            totalCount,
            page,
            limit,
            totalPages
        }
    });
});

/**
 * @desc    Lấy thông tin chi tiết một khuyến mãi
 * @route   GET /api/promotions/:id
 * @access  Public
 */
exports.getPromotion = catchAsync(async (req, res, next) => {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
        return next(new AppError('Không tìm thấy khuyến mãi với ID này', 404));
    }

    // Ẩn khuyến mãi hết hạn hoặc chưa đến hạn cho người dùng thông thường
    if (
        promotion.status !== 'active' &&
        (!req.user || !['admin', 'manager'].includes(req.user.role))
    ) {
        return next(new AppError('Khuyến mãi này hiện không khả dụng', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            promotion
        }
    });
});

/**
 * @desc    Tạo khuyến mãi mới
 * @route   POST /api/promotions
 * @access  Private (Admin, Manager)
 */
exports.createPromotion = catchAsync(async (req, res, next) => {
    const newPromotion = await Promotion.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            promotion: newPromotion
        }
    });
});

/**
 * @desc    Cập nhật thông tin khuyến mãi
 * @route   PATCH /api/promotions/:id
 * @access  Private (Admin, Manager)
 */
exports.updatePromotion = catchAsync(async (req, res, next) => {
    const promotion = await Promotion.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!promotion) {
        return next(new AppError('Không tìm thấy khuyến mãi với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            promotion
        }
    });
});

/**
 * @desc    Xóa khuyến mãi
 * @route   DELETE /api/promotions/:id
 * @access  Private (Admin)
 */
exports.deletePromotion = catchAsync(async (req, res, next) => {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
        return next(new AppError('Không tìm thấy khuyến mãi với ID này', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

/**
 * @desc    Kiểm tra mã khuyến mãi
 * @route   POST /api/promotions/check-coupon
 * @access  Private
 */
exports.checkCoupon = catchAsync(async (req, res, next) => {
    const { couponCode, movieId, cinemaId, totalAmount } = req.body;

    if (!couponCode) {
        return next(new AppError('Vui lòng cung cấp mã khuyến mãi', 400));
    }

    // Tìm khuyến mãi theo mã coupon
    const promotion = await Promotion.findOne({
        couponCode: couponCode.toUpperCase(),
        status: 'active'
    });

    if (!promotion) {
        return next(new AppError('Mã khuyến mãi không hợp lệ hoặc đã hết hạn', 404));
    }

    // Kiểm tra xem khuyến mãi có áp dụng được không
    const now = new Date();
    const orderDetails = {
        totalAmount,
        movieId,
        cinemaId,
        date: now
    };

    if (!promotion.isApplicable(orderDetails)) {
        return next(new AppError('Khuyến mãi không áp dụng được cho đơn hàng này', 400));
    }

    // Tính toán số tiền giảm
    const discountAmount = promotion.calculateDiscount(totalAmount);

    res.status(200).json({
        status: 'success',
        data: {
            promotion,
            discountAmount,
            finalAmount: totalAmount - discountAmount
        }
    });
});

/**
 * @desc    Khởi tạo lại trạng thái khuyến mãi dựa vào ngày
 * @route   PATCH /api/promotions/update-status
 * @access  Private (Admin, System)
 */
exports.updatePromotionStatus = catchAsync(async (req, res, next) => {
    const now = new Date();

    // Cập nhật trạng thái các khuyến mãi dựa vào ngày
    const upcomingToActive = await Promotion.updateMany(
        {
            status: 'upcoming',
            startDate: { $lte: now }
        },
        { status: 'active' }
    );

    const activeToExpired = await Promotion.updateMany(
        {
            status: 'active',
            endDate: { $lte: now }
        },
        { status: 'expired' }
    );

    res.status(200).json({
        status: 'success',
        data: {
            upcomingToActive: upcomingToActive.nModified,
            activeToExpired: activeToExpired.nModified
        }
    });
});

/**
 * @desc    Lấy khuyến mãi theo mã coupon
 * @route   GET /api/promotions/coupon/:couponCode
 * @access  Private
 */
exports.getPromotionByCoupon = catchAsync(async (req, res, next) => {
    const couponCode = req.params.couponCode.toUpperCase();

    const promotion = await Promotion.findOne({
        couponCode,
        status: 'active'
    });

    if (!promotion) {
        return next(new AppError('Mã khuyến mãi không hợp lệ hoặc đã hết hạn', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            promotion
        }
    });
});