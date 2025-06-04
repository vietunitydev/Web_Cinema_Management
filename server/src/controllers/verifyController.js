// src/controllers/verifyController.js
const Booking = require('../models/Booking');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Xác thực vé từ QR code
 * @route   GET /api/verify/booking/:bookingId
 * @access  Public (cho nhân viên rạp)
 */
exports.verifyBooking = catchAsync(async (req, res, next) => {
    const { bookingId } = req.params;

    // Tìm booking theo ID
    const booking = await Booking.findById(bookingId)
        .populate('movieId', 'title posterUrl duration genre ageRestriction')
        .populate('cinemaId', 'name location.address')
        .populate('showtimeId', 'startTime endTime format language');

    if (!booking) {
        return next(new AppError('Vé không tồn tại', 404));
    }

    // Kiểm tra trạng thái booking
    let verificationStatus = 'valid';
    let message = 'Vé hợp lệ và có thể sử dụng';

    if (booking.status === 'canceled') {
        verificationStatus = 'invalid';
        message = 'Vé đã bị hủy';
    } else if (booking.status === 'pending') {
        verificationStatus = 'pending';
        message = 'Vé chưa được xác nhận thanh toán';
    } else if (booking.showtimeId && new Date(booking.showtimeId.startTime) < new Date()) {
        verificationStatus = 'expired';
        message = 'Suất chiếu đã kết thúc, vé hết hiệu lực';
    }

    // Ghi log việc xác thực (tùy chọn)
    console.log(`Booking verification: ${bookingId} - Status: ${verificationStatus} - Time: ${new Date().toISOString()}`);

    res.status(200).json({
        status: 'success',
        data: {
            booking,
            verification: {
                status: verificationStatus,
                message,
                verifiedAt: new Date().toISOString()
            }
        }
    });
});

/**
 * @desc    Xác thực vé bằng mã booking code
 * @route   GET /api/verify/booking-code/:bookingCode
 * @access  Public (cho nhân viên rạp)
 */
exports.verifyBookingByCode = catchAsync(async (req, res, next) => {
    const { bookingCode } = req.params;

    // Tìm booking theo booking code
    const booking = await Booking.findOne({ bookingCode })
        .populate('movieId', 'title posterUrl duration genre ageRestriction')
        .populate('cinemaId', 'name location.address')
        .populate('showtimeId', 'startTime endTime format language');

    if (!booking) {
        return next(new AppError('Không tìm thấy vé với mã này', 404));
    }

    // Kiểm tra trạng thái booking
    let verificationStatus = 'valid';
    let message = 'Vé hợp lệ và có thể sử dụng';

    if (booking.status === 'canceled') {
        verificationStatus = 'invalid';
        message = 'Vé đã bị hủy';
    } else if (booking.status === 'pending') {
        verificationStatus = 'pending';
        message = 'Vé chưa được xác nhận thanh toán';
    } else if (booking.showtimeId && new Date(booking.showtimeId.startTime) < new Date()) {
        verificationStatus = 'expired';
        message = 'Suất chiếu đã kết thúc, vé hết hiệu lực';
    }

    // Ghi log việc xác thực
    console.log(`Booking verification by code: ${bookingCode} - Status: ${verificationStatus} - Time: ${new Date().toISOString()}`);

    res.status(200).json({
        status: 'success',
        data: {
            booking,
            verification: {
                status: verificationStatus,
                message,
                verifiedAt: new Date().toISOString()
            }
        }
    });
});

/**
 * @desc    Lấy thống kê xác thực vé (cho admin/manager)
 * @route   GET /api/verify/stats
 * @access  Private (Admin, Manager)
 */
exports.getVerificationStats = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    // Tạo filter theo ngày nếu có
    let dateFilter = {};
    if (startDate && endDate) {
        dateFilter = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
    }

    // Thống kê theo trạng thái booking
    const statusStats = await Booking.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$finalAmount' }
            }
        }
    ]);

    // Thống kê booking theo ngày
    const dailyStats = await Booking.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                count: { $sum: 1 },
                totalAmount: { $sum: '$finalAmount' }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
        { $limit: 30 }
    ]);

    // Thống kê theo rạp
    const cinemaStats = await Booking.aggregate([
        { $match: dateFilter },
        {
            $lookup: {
                from: 'cinemas',
                localField: 'cinemaId',
                foreignField: '_id',
                as: 'cinema'
            }
        },
        { $unwind: '$cinema' },
        {
            $group: {
                _id: '$cinemaId',
                cinemaName: { $first: '$cinema.name' },
                count: { $sum: 1 },
                totalAmount: { $sum: '$finalAmount' }
            }
        },
        { $sort: { count: -1 } }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            statusStats,
            dailyStats,
            cinemaStats
        }
    });
});