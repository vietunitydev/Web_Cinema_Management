const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// Middleware để kiểm tra và trả về lỗi validation
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return next(new AppError(errorMessages.join('. '), 400));
    }
    next();
};

// Validation rules cho đăng ký người dùng
exports.registerValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Tên đăng nhập không được để trống')
        .isLength({ min: 4 }).withMessage('Tên đăng nhập phải có ít nhất 4 ký tự')
        .isAlphanumeric().withMessage('Tên đăng nhập chỉ chấp nhận chữ cái và số'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ'),

    body('passwordHash')
        .trim()
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

    body('confirmPassword')
        .trim()
        .notEmpty().withMessage('Vui lòng xác nhận mật khẩu')
        .custom((value, { req }) => {
            if (value !== req.body.passwordHash) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }
            return true;
        }),

    body('fullName')
        .trim()
        .notEmpty().withMessage('Họ tên đầy đủ không được để trống'),

    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ')
];

// Validation rules cho đăng nhập
exports.loginValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập tên đăng nhập hoặc email'),

    body('password')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập mật khẩu')
];

// Validation rules cho thêm/cập nhật phim
exports.movieValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Tên phim không được để trống'),

    body('description')
        .trim()
        .notEmpty().withMessage('Mô tả phim không được để trống'),

    body('duration')
        .isInt({ min: 1 }).withMessage('Thời lượng phim phải là số nguyên dương'),

    body('releaseDate')
        .isISO8601().withMessage('Ngày phát hành không hợp lệ'),

    body('endDate')
        .isISO8601().withMessage('Ngày kết thúc không hợp lệ')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.releaseDate)) {
                throw new Error('Ngày kết thúc phải sau ngày phát hành');
            }
            return true;
        }),

    body('language')
        .trim()
        .notEmpty().withMessage('Ngôn ngữ phim không được để trống')
];

// Validation rules cho thêm/cập nhật rạp chiếu phim
exports.cinemaValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên rạp không được để trống'),

    body('location.address')
        .trim()
        .notEmpty().withMessage('Địa chỉ không được để trống'),

    body('location.city')
        .trim()
        .notEmpty().withMessage('Thành phố không được để trống'),

    body('openTime')
        .trim()
        .notEmpty().withMessage('Giờ mở cửa không được để trống')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ mở cửa phải có định dạng HH:MM'),

    body('closeTime')
        .trim()
        .notEmpty().withMessage('Giờ đóng cửa không được để trống')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ đóng cửa phải có định dạng HH:MM')
];

// Validation rules cho thêm/cập nhật phòng chiếu
exports.hallValidation = [
    body('hallId')
        .trim()
        .notEmpty().withMessage('Mã phòng chiếu không được để trống'),

    body('name')
        .trim()
        .notEmpty().withMessage('Tên phòng chiếu không được để trống'),

    body('capacity')
        .isInt({ min: 1 }).withMessage('Sức chứa phải là số nguyên dương'),

    body('type')
        .isIn(['Regular', 'VIP', 'IMAX', '4DX']).withMessage('Loại phòng chiếu không hợp lệ'),

    body('seatingArrangement.rows')
        .isInt({ min: 1 }).withMessage('Số hàng ghế phải là số nguyên dương'),

    body('seatingArrangement.seatsPerRow')
        .isInt({ min: 1 }).withMessage('Số ghế mỗi hàng phải là số nguyên dương')
];

// Validation rules cho thêm/cập nhật lịch chiếu
exports.showtimeValidation = [
    body('movieId')
        .isMongoId().withMessage('ID phim không hợp lệ'),

    body('cinemaId')
        .isMongoId().withMessage('ID rạp không hợp lệ'),

    body('hallId')
        .trim()
        .notEmpty().withMessage('ID phòng chiếu không được để trống'),

    body('startTime')
        .isISO8601().withMessage('Thời gian bắt đầu không hợp lệ'),

    body('endTime')
        .isISO8601().withMessage('Thời gian kết thúc không hợp lệ')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startTime)) {
                throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
            }
            return true;
        }),

    body('price.regular')
        .isFloat({ min: 0 }).withMessage('Giá vé thường phải là số dương'),

    body('price.vip')
        .isFloat({ min: 0 }).withMessage('Giá vé VIP phải là số dương')
];

// Validation rules cho đặt vé
exports.bookingValidation = [
    body('showtimeId')
        .isMongoId().withMessage('ID suất chiếu không hợp lệ'),

    body('seats')
        .isArray({ min: 1 }).withMessage('Phải chọn ít nhất một ghế'),

    body('seats.*')
        .trim()
        .notEmpty().withMessage('Mã ghế không được để trống')
];

// Validation rules cho đánh giá phim
exports.reviewValidation = [
    body('movieId')
        .isMongoId().withMessage('ID phim không hợp lệ'),

    body('bookingId')
        .isMongoId().withMessage('ID đặt vé không hợp lệ'),

    body('rating')
        .isInt({ min: 1, max: 5 }).withMessage('Đánh giá phải từ 1 đến 5 sao'),

    body('content')
        .trim()
        .notEmpty().withMessage('Nội dung đánh giá không được để trống')
];

// Validation rules cho thêm/cập nhật khuyến mãi
exports.promotionValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên khuyến mãi không được để trống'),

    body('description')
        .trim()
        .notEmpty().withMessage('Mô tả khuyến mãi không được để trống'),

    body('type')
        .isIn(['percentage', 'fixed_amount', 'buy_one_get_one']).withMessage('Loại khuyến mãi không hợp lệ'),

    body('value')
        .isFloat({ min: 0 }).withMessage('Giá trị khuyến mãi phải là số dương'),

    body('startDate')
        .isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),

    body('endDate')
        .isISO8601().withMessage('Ngày kết thúc không hợp lệ')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDate)) {
                throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
            }
            return true;
        }),

    body('couponCode')
        .trim()
        .notEmpty().withMessage('Mã khuyến mãi không được để trống'),

    body('usageLimit')
        .isInt({ min: 1 }).withMessage('Giới hạn sử dụng phải là số nguyên dương')
];