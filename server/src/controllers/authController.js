const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendToken } = require('../utils/generateToken');

/**
 * @desc    Đăng ký người dùng mới
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res, next) => {
    const { username, email, passwordHash, confirmPassword, fullName, phone, dateOfBirth, address } = req.body;

    // Kiểm tra người dùng đã tồn tại chưa
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
        return next(new AppError('Tên đăng nhập hoặc email đã tồn tại', 400));
    }

    // Tạo người dùng mới
    const user = await User.create({
        username,
        email,
        passwordHash,
        fullName,
        phone,
        dateOfBirth,
        address,
        role: 'customer' // Mặc định là khách hàng
    });

    // Tạo token và trả về response
    sendToken(user, 201, res);
});

/**
 * @desc    Đăng nhập người dùng
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    // Kiểm tra đã nhập username/email và password chưa
    if (!username || !password) {
        return next(new AppError('Vui lòng nhập tên đăng nhập/email và mật khẩu', 400));
    }

    // Tìm người dùng theo username hoặc email
    const user = await User.findOne({
        $or: [{ username }, { email: username }]
    }).select('+passwordHash');

    // Nếu không tìm thấy hoặc mật khẩu không đúng
    if (!user || !(await user.matchPassword(password))) {
        return next(new AppError('Tên đăng nhập hoặc mật khẩu không đúng', 401));
    }

    // Tạo token và trả về response
    sendToken(user, 200, res);
});

/**
 * @desc    Đăng xuất người dùng
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = (req, res) => {
    // Xóa cookie jwt
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        status: 'success',
        message: 'Đăng xuất thành công'
    });
};

/**
 * @desc    Lấy thông tin người dùng hiện tại
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = catchAsync(async (req, res, next) => {
    // req.user đã được đặt từ middleware protect
    const user = await User.findById(req.user.id);

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

/**
 * @desc    Cập nhật thông tin người dùng
 * @route   PATCH /api/auth/updateme
 * @access  Private
 */
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Tạo lỗi nếu user cố gắng cập nhật mật khẩu
    if (req.body.passwordHash || req.body.passwordConfirm) {
        return next(
            new AppError(
                'Route này không dùng để cập nhật mật khẩu. Vui lòng sử dụng /updatepassword.',
                400
            )
        );
    }

    // 2) Lọc các trường không được phép cập nhật
    const filteredBody = filterObj(req.body, 'fullName', 'email', 'phone', 'dateOfBirth', 'address', 'preferences');

    // 3) Cập nhật tài khoản
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

/**
 * @desc    Cập nhật mật khẩu
 * @route   PATCH /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Lấy thông tin user từ collection
    const user = await User.findById(req.user.id).select('+passwordHash');

    // 2) Kiểm tra mật khẩu hiện tại có đúng không
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new AppError('Mật khẩu hiện tại không đúng', 401));
    }

    // 3) Cập nhật mật khẩu
    user.passwordHash = req.body.newPassword;
    await user.save();

    // 4) Đăng nhập lại, gửi JWT
    sendToken(user, 200, res);
});

/**
 * Lọc các trường trong object
 * @param {Object} obj - Object cần lọc
 * @param  {...String} allowedFields - Các trường được phép
 * @returns {Object} Object đã lọc
 */
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};