const Movie = require('../models/Movie');
const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('../config/cloudinary');
const mongoose = require("mongoose");

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

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next();

    const movie = await Movie.findById(req.params.id).populate('reviews');

    if (!movie) {
        return next(new AppError('Không tìm thấy phim với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: movie,
    });
});

/**
 * @desc    Tạo phim mới
 * @route   POST /api/movies
 * @access  Private (Admin)
 */
exports.createMovie = catchAsync(async (req, res, next) => {
    // Xử lý URL poster nếu đã có từ middleware
    // if (req.body.posterUrl) {
    //     req.body.posterUrl = req.body.posterUrl;
    // }
    //
    // // Xử lý URL trailer nếu có
    // if (req.body.trailerUrl) {
    //     // Có thể thêm logic kiểm tra URL trailer hợp lệ ở đây
    // }

    console.log(req.body);

    // Tạo phim mới
    const newMovie = await Movie.create(req.body);

    console.log("created done");


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
 * @desc    Tìm kiếm phim
 * @route   GET /api/movies/search
 * @access  Public
 */
exports.searchMovies = catchAsync(async (req, res, next) => {
    const { query, page = 1, limit = 10 } = req.query;

    // Validate query parameter
    if (!query || query.trim() === '') {
        return next(new AppError('Vui lòng nhập từ khóa tìm kiếm', 400));
    }

    // Parse and validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Giới hạn tối đa 100 items/page
    const skip = (pageNum - 1) * limitNum;

    // Trim and escape special regex characters if needed
    const searchTerm = query.trim();

    // Build search query
    const searchQuery = {
        $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { director: { $regex: searchTerm, $options: 'i' } },
            { cast: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
            { genre: { $elemMatch: { $regex: searchTerm, $options: 'i' } } }
        ]
    };

    // Execute search and count in parallel for better performance
    const [movies, totalCount] = await Promise.all([
        Movie.find(searchQuery)
            .select('-__v') // Exclude version field
            .skip(skip)
            .limit(limitNum)
            .lean(), // Use lean() for better performance if you don't need mongoose documents
        Movie.countDocuments(searchQuery)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
        status: 'success',
        data: {
            data: movies,
            totalCount,
            page: pageNum,
            limit: limitNum,
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

    const baseQuery = { rating: { $gt: 0 } };

    const data = await Movie.find({ rating: { $gt: 0 } })
        .sort({ rating: -1 })
        .skip(skip)
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

/**
 * @desc    Lấy danh sách options phim cho dropdown
 * @route   GET /api/movies/options
 * @access  Private (Admin, Manager)
 */
exports.getMovieOptions = catchAsync(async (req, res, next) => {
    console.log("get movie options");
    // Chỉ lấy các thông tin cần thiết: id và title
    const movieOptions = await Movie.find({})
        .select('_id title')
        .sort({ title: 1 }); // Sắp xếp theo tên để dễ tìm

    res.status(200).json({
        status: 'success',
        data: movieOptions
    });
});