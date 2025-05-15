const Cinema = require('../models/Cinema');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @desc    Lấy tất cả rạp chiếu phim
 * @route   GET /api/cinemas
 * @access  Public
 */
exports.getAllCinemas = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Cinema.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const cinemas = await features.query;

    res.status(200).json({
        status: 'success',
        data: {
            data: cinemas
        }
    });
});

/**
 * @desc    Lấy thông tin chi tiết một rạp
 * @route   GET /api/cinemas/:id
 * @access  Public
 */
exports.getCinema = catchAsync(async (req, res, next) => {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
        return next(new AppError('Không tìm thấy rạp với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            cinema
        }
    });
});

/**
 * @desc    Tạo rạp chiếu phim mới
 * @route   POST /api/cinemas
 * @access  Private (Admin)
 */
exports.createCinema = catchAsync(async (req, res, next) => {
    const newCinema = await Cinema.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            cinema: newCinema
        }
    });
});

/**
 * @desc    Cập nhật thông tin rạp
 * @route   PATCH /api/cinemas/:id
 * @access  Private (Admin, Manager)
 */
exports.updateCinema = catchAsync(async (req, res, next) => {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!cinema) {
        return next(new AppError('Không tìm thấy rạp với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            cinema
        }
    });
});

/**
 * @desc    Xóa rạp
 * @route   DELETE /api/cinemas/:id
 * @access  Private (Admin)
 */
exports.deleteCinema = catchAsync(async (req, res, next) => {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);

    if (!cinema) {
        return next(new AppError('Không tìm thấy rạp với ID này', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

/**
 * @desc    Lấy tất cả phòng chiếu của một rạp
 * @route   GET /api/cinemas/:id/halls
 * @access  Public
 */
exports.getCinemaHalls = catchAsync(async (req, res, next) => {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
        return next(new AppError('Không tìm thấy rạp với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: cinema.halls
    });
});

/**
 * @desc    Thêm phòng chiếu mới cho rạp
 * @route   POST /api/cinemas/:id/halls
 * @access  Private (Admin, Manager)
 */
exports.addCinemaHall = catchAsync(async (req, res, next) => {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
        return next(new AppError('Không tìm thấy rạp với ID này', 404));
    }

    // Kiểm tra xem hallId đã tồn tại chưa
    const hallExists = cinema.halls.some(hall => hall.hallId === req.body.hallId);
    if (hallExists) {
        return next(new AppError('Mã phòng chiếu đã tồn tại', 400));
    }

    // Thêm phòng chiếu mới
    cinema.halls.push(req.body);
    await cinema.save();

    res.status(201).json({
        status: 'success',
        data: {
            hall: cinema.halls[cinema.halls.length - 1]
        }
    });
});

/**
 * @desc    Cập nhật thông tin phòng chiếu
 * @route   PATCH /api/cinemas/:id/halls/:hallId
 * @access  Private (Admin, Manager)
 */
exports.updateCinemaHall = catchAsync(async (req, res, next) => {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
        return next(new AppError('Không tìm thấy rạp với ID này', 404));
    }

    // Tìm index của phòng chiếu
    const hallIndex = cinema.halls.findIndex(
        hall => hall.hallId === req.params.hallId
    );

    if (hallIndex === -1) {
        return next(new AppError('Không tìm thấy phòng chiếu với ID này', 404));
    }

    // Cập nhật thông tin phòng chiếu
    cinema.halls[hallIndex] = {
        ...cinema.halls[hallIndex].toObject(),
        ...req.body,
        hallId: req.params.hallId // Đảm bảo hallId không thay đổi
    };

    await cinema.save();

    res.status(200).json({
        status: 'success',
        data: {
            hall: cinema.halls[hallIndex]
        }
    });
});

/**
 * @desc    Xóa phòng chiếu
 * @route   DELETE /api/cinemas/:id/halls/:hallId
 * @access  Private (Admin, Manager)
 */
exports.deleteCinemaHall = catchAsync(async (req, res, next) => {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
        return next(new AppError('Không tìm thấy rạp với ID này', 404));
    }

    // Tìm index của phòng chiếu
    const hallIndex = cinema.halls.findIndex(
        hall => hall.hallId === req.params.hallId
    );

    if (hallIndex === -1) {
        return next(new AppError('Không tìm thấy phòng chiếu với ID này', 404));
    }

    // Xóa phòng chiếu
    cinema.halls.splice(hallIndex, 1);
    await cinema.save();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

/**
 * @desc    Lấy thông tin một phòng chiếu
 * @route   GET /api/cinemas/:id/halls/:hallId
 * @access  Public
 */
exports.getCinemaHall = catchAsync(async (req, res, next) => {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
        return next(new AppError('Không tìm thấy rạp với ID này', 404));
    }

    const hall = cinema.halls.find(hall => hall.hallId === req.params.hallId);

    if (!hall) {
        return next(new AppError('Không tìm thấy phòng chiếu với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            hall
        }
    });
});

/**
 * @desc    Tìm kiếm rạp theo thành phố
 * @route   GET /api/cinemas/city/:city
 * @access  Public
 */
exports.getCinemasByCity = catchAsync(async (req, res, next) => {
    const city = req.params.city;

    const cinemas = await Cinema.find({ 'location.city': { $regex: new RegExp(city, 'i') } });

    res.status(200).json({
        status: 'success',
        results: cinemas.length,
        data: {
            cinemas
        }
    });
});