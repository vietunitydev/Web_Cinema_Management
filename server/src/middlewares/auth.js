const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware xác thực người dùng thông qua JWT
 */
exports.protect = catchAsync(async (req, res, next) => {
    // 1) Lấy token từ header hoặc cookie
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.', 401)
        );
    }

    // 2) Xác thực token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Kiểm tra xem người dùng vẫn tồn tại không
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError('Người dùng sở hữu token này không còn tồn tại.', 401)
        );
    }

    // 4) Kiểm tra xem người dùng có thay đổi mật khẩu sau khi token được tạo không
    if (currentUser.changedPasswordAfter &&
        currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('Người dùng đã thay đổi mật khẩu! Vui lòng đăng nhập lại.', 401)
        );
    }

    // Đưa thông tin người dùng vào request để sử dụng ở middleware tiếp theo
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

/**
 * Middleware kiểm tra quyền người dùng
 * @param  {...string} roles - Các vai trò có quyền truy cập
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Kiểm tra vai trò người dùng
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('Bạn không có quyền thực hiện hành động này.', 403)
            );
        }

        next();
    };
};

/**
 * Middleware để kiểm tra xem người dùng đã đăng nhập chưa (không báo lỗi nếu chưa)
 * Dùng cho các trang không bắt buộc đăng nhập
 */
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) Xác thực token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Kiểm tra xem người dùng vẫn tồn tại không
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Kiểm tra xem người dùng có thay đổi mật khẩu sau khi token được tạo không
            if (currentUser.changedPasswordAfter &&
                currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // 4) Người dùng đã đăng nhập
            req.user = currentUser;
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};