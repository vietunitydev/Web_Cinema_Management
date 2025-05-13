const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const AppError = require('../utils/appError');

// Cấu hình lưu trữ tệp tạm thời
const multerStorage = multer.memoryStorage();

// Lọc tệp, chỉ chấp nhận hình ảnh
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Không phải tệp hình ảnh! Vui lòng tải lên chỉ hình ảnh.', 400), false);
    }
};

// Cấu hình Multer
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

// Cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'cinema',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
        transformation: [{ width: 500, height: 750, crop: 'limit' }],
    },
});

// Cấu hình Multer với Cloudinary
const uploadToCloudinary = multer({
    storage: cloudinaryStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

// Middleware cho tải lên một hình ảnh
exports.uploadSingle = upload.single('image');

// Middleware cho tải lên nhiều hình ảnh
exports.uploadMultiple = upload.array('images', 5);

// Middleware cho tải lên nhiều hình ảnh với các trường khác nhau
exports.uploadFields = upload.fields([
    { name: 'posterImage', maxCount: 1 },
    { name: 'backdropImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 5 }
]);

// Middleware để tải lên một hình ảnh lên Cloudinary
exports.uploadSingleToCloudinary = uploadToCloudinary.single('image');

// Middleware để tải lên nhiều hình ảnh lên Cloudinary
exports.uploadMultipleToCloudinary = uploadToCloudinary.array('images', 5);

// Middleware để xử lý sau khi tải lên (không sử dụng Cloudinary trực tiếp)
exports.resizeAndUpload = async (req, res, next) => {
    if (!req.file) return next();

    try {
        // Tải lên hình ảnh lên Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'cinema',
            transformation: [{ width: 500, height: 750, crop: 'limit' }],
        });

        // Lưu URL hình ảnh vào req.body
        req.body.imageUrl = result.secure_url;
        req.body.imageId = result.public_id;

        next();
    } catch (error) {
        return next(new AppError('Lỗi khi tải hình ảnh lên. Vui lòng thử lại.', 500));
    }
};

// Middleware xử lý tải lên hình ảnh của phim
exports.uploadMovieImages = uploadToCloudinary.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'backdrop', maxCount: 1 }
]);

// Xử lý hình ảnh phim sau khi tải lên
exports.processMovieImages = (req, res, next) => {
    if (!req.files) return next();

    if (req.files.poster) {
        req.body.posterUrl = req.files.poster[0].path;
    }

    if (req.files.backdrop) {
        req.body.backdropUrl = req.files.backdrop[0].path;
    }

    next();
};