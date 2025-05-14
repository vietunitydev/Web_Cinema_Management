const Movie = require('../models/Movie');
const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('../config/cloudinary');

/**
 * @desc    Lấy tất cả phim
 * @route   GET /api/movies
 * @access  Public
 */
exports.getAllMovies = catchAsync(async (req, res, next) => {
    // Thực hiện query với filtering, sorting, pagination
    const features = new APIFeatures(Movie.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const data = await features.query;

    const totalCount = await Movie.countDocuments(features.queryObj);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
 * @desc    Lấy thông tin chi tiết một phim
 * @route   GET /api/movies/:id
 * @access  Public
 */
exports.getMovie = catchAsync(async (req, res, next) => {
    const movie = await Movie.findById(req.params.id).populate('reviews');

    if (!movie) {
        return next(new AppError('Không tìm thấy phim với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            movie
        }
    });
});

/**
 * @desc    Tạo phim mới
 * @route   POST /api/movies
 * @access  Private (Admin)
 */
exports.createMovie = catchAsync(async (req, res, next) => {
    // Xử lý URL poster nếu đã có từ middleware
    if (req.body.posterUrl) {
        req.body.posterUrl = req.body.posterUrl;
    }

    // Xử lý URL trailer nếu có
    if (req.body.trailerUrl) {
        // Có thể thêm logic kiểm tra URL trailer hợp lệ ở đây
    }

    // Tạo phim mới
    const newMovie = await Movie.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            movie: newMovie
        }
    });
});

/**
 * @desc    Cập nhật thông tin phim
 * @route   PATCH /api/movies/:id
 * @access  Private (Admin)
 */
exports.updateMovie = catchAsync(async (req, res, next) => {
    // Tìm phim và cập nhật
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!movie) {
        return next(new AppError('Không tìm thấy phim với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            movie
        }
    });
});

/**
 * @desc    Xóa phim
 * @route   DELETE /api/movies/:id
 * @access  Private (Admin)
 */
exports.deleteMovie = catchAsync(async (req, res, next) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
        return next(new AppError('Không tìm thấy phim với ID này', 404));
    }

    // Xóa poster từ Cloudinary nếu có
    if (movie.posterUrl && movie.posterUrl.startsWith('https://res.cloudinary.com')) {
        const publicId = movie.posterUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`cinema/${publicId}`);
    }

    // Xóa phim
    await movie.remove();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

/**
 * @desc    Lấy các phim đang chiếu
 * @route   GET /api/movies/now-playing
 * @access  Public
 */
exports.getNowPlaying = catchAsync(async (req, res, next) => {
    const today = new Date();

    const features = new APIFeatures(
        Movie.find({
            releaseDate: { $lte: today },
            endDate: { $gte: today },
            status: 'active'
        }),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const data = await features.query;

    const totalCount = await Movie.countDocuments({...baseQuery, ...features.queryObj});
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
 * @desc    Lấy các phim sắp chiếu
 * @route   GET /api/movies/coming-soon
 * @access  Public
 */
exports.getComingSoon = catchAsync(async (req, res, next) => {
    const today = new Date();

    const features = new APIFeatures(
        Movie.find({
            releaseDate: { $gt: today },
            status: 'coming_soon'
        }),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const data = await features.query;

    const totalCount = await Movie.countDocuments({...baseQuery, ...features.queryObj});
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
 * @desc    Tìm kiếm phim
 * @route   GET /api/movies/search
 * @access  Public
 */
exports.searchMovies = catchAsync(async (req, res, next) => {
    const { keyword } = req.query;

    if (!keyword) {
        return next(new AppError('Vui lòng nhập từ khóa tìm kiếm', 400));
    }

    const data = await Movie.find({
        $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { director: { $regex: keyword, $options: 'i' } },
            { cast: { $in: [new RegExp(keyword, 'i')] } },
            { genre: { $in: [new RegExp(keyword, 'i')] } }
                    ]
                });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Movie.countDocuments(searchQuery);
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
 * @desc    Lấy top phim được đánh giá cao
 * @route   GET /api/movies/top-rated
 * @access  Public
 */
exports.getTopRated = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const data = await Movie.find({ rating: { $gt: 0 } })
        .sort({ rating: -1 })
        .limit(limit);

    const totalCount = await Movie.countDocuments(baseQuery);
    const totalPages = Math.ceil(totalCount / limit);

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