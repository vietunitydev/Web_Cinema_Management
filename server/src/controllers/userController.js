const User = require('../models/User');
const Booking = require('../models/Booking');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @desc    Lấy tất cả người dùng
 * @route   GET /api/users
 * @access  Private (Admin)
 */
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const data = await features.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await User.countDocuments(features.queryObj);
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
 * @desc    Lấy thông tin một người dùng
 * @route   GET /api/users/:id
 * @access  Private (Admin)
 */
exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: user
    });
});

/**
 * @desc    Tạo người dùng mới (chỉ admin)
 * @route   POST /api/users
 * @access  Private (Admin)
 */
exports.createUser = catchAsync(async (req, res, next) => {
    // Kiểm tra email và username đã tồn tại chưa
    const { email, username } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
        return next(new AppError('Email hoặc tên đăng nhập đã tồn tại', 400));
    }

    // Tạo người dùng mới
    const newUser = await User.create(req.body);

    // Xóa mật khẩu từ output
    newUser.passwordHash = undefined;

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
    });
});

/**
 * @desc    Cập nhật thông tin người dùng
 * @route   PATCH /api/users/:id
 * @access  Private (Admin)
 */
exports.updateUser = catchAsync(async (req, res, next) => {
    // Không cho phép cập nhật mật khẩu qua route này
    if (req.body.passwordHash) {
        return next(new AppError('Route này không dùng để cập nhật mật khẩu', 400));
    }

    // Cập nhật thông tin người dùng
    const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

/**
 * @desc    Xóa người dùng
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

/**
 * @desc    Vô hiệu hóa tài khoản người dùng
 * @route   PATCH /api/users/:id/deactivate
 * @access  Private (Admin)
 */
exports.deactivateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        {
            new: true,
            runValidators: true
        }
    );

    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

/**
 * @desc    Kích hoạt lại tài khoản người dùng
 * @route   PATCH /api/users/:id/activate
 * @access  Private (Admin)
 */
exports.activateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        {
            new: true,
            runValidators: true
        }
    );

    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: user
    });
});

/**
 * @desc    Thống kê người dùng
 * @route   GET /api/users/stats
 * @access  Private (Admin)
 */
exports.getUserStats = catchAsync(async (req, res, next) => {
    // Thống kê số lượng người dùng theo vai trò
    const roleStats = await User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);

    // Thống kê số lượng người dùng đăng ký theo tháng
    const monthlyStats = await User.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$registrationDate' },
                    month: { $month: '$registrationDate' }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                '_id.year': -1,
                '_id.month': -1
            }
        },
        {
            $limit: 12
        }
    ]);

    // Format lại kết quả
    const formattedMonthlyStats = monthlyStats.map(stat => ({
        year: stat._id.year,
        month: stat._id.month,
        count: stat.count
    }));

    res.status(200).json({
        status: 'success',
        data: {
            roleStats,
            monthlyStats: formattedMonthlyStats
        }
    });
});

/**
 * @desc    Lấy lịch sử đặt vé của người dùng
 * @route   GET /api/users/:id/bookings
 * @access  Private (Admin, User - chỉ với ID của mình)
 */
exports.getUserBookings = catchAsync(async (req, res, next) => {
    // Kiểm tra quyền truy cập
    if (
        req.user.role === 'customer' &&
        req.params.id !== req.user.id.toString()
    ) {
        return next(new AppError('Bạn không có quyền truy cập dữ liệu này', 403));
    }

    // Kiểm tra người dùng tồn tại
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }

    const features = new APIFeatures(
        Booking.find({ userId: req.params.id }),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const data = await features.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalCount = await Booking.countDocuments(features.queryObj);
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