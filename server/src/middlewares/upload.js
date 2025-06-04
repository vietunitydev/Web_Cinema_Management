// src/middlewares/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/appError');
const path = require('path');

// Configure Cloudinary storage for movie images
const movieStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'cinema/movies',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [
            { width: 500, height: 750, crop: 'fill', quality: 'auto' }, // Poster ratio
        ],
        public_id: (req, file) => {
            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 8);
            return `movie_${timestamp}_${randomString}`;
        }
    }
});

// Configure multer for movie images
const uploadMovie = multer({
    storage: movieStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 2 // Max 2 files (poster + trailer thumbnail)
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);

        if (mimeType && extName) {
            return cb(null, true);
        } else {
            cb(new AppError('Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, GIF)', 400));
        }
    }
});

// Middleware for uploading movie images
exports.uploadMovieImages = uploadMovie.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'trailerThumbnail', maxCount: 1 }
]);

// Process uploaded movie images
exports.processMovieImages = (req, res, next) => {
    try {
        console.log('Processing movie images...');
        console.log('Files:', req.files);
        console.log('Body:', req.body);

        // Process poster
        if (req.files && req.files.poster && req.files.poster[0]) {
            req.body.posterUrl = req.files.poster[0].path;
            console.log('Poster uploaded:', req.body.posterUrl);
        }

        // Process trailer thumbnail
        if (req.files && req.files.trailerThumbnail && req.files.trailerThumbnail[0]) {
            req.body.trailerThumbnailUrl = req.files.trailerThumbnail[0].path;
            console.log('Trailer thumbnail uploaded:', req.body.trailerThumbnailUrl);
        }

        // Process array fields that come as JSON strings
        if (req.body.cast && typeof req.body.cast === 'string') {
            try {
                req.body.cast = JSON.parse(req.body.cast);
            } catch (error) {
                req.body.cast = req.body.cast.split(',').map(item => item.trim());
            }
        }

        if (req.body.genre && typeof req.body.genre === 'string') {
            try {
                req.body.genre = JSON.parse(req.body.genre);
            } catch (error) {
                req.body.genre = req.body.genre.split(',').map(item => item.trim());
            }
        }

        if (req.body.subtitles && typeof req.body.subtitles === 'string') {
            try {
                req.body.subtitles = JSON.parse(req.body.subtitles);
            } catch (error) {
                req.body.subtitles = req.body.subtitles.split(',').map(item => item.trim());
            }
        }

        console.log('Processed body:', req.body);
        next();
    } catch (error) {
        console.error('Error processing movie images:', error);
        next(new AppError('Lỗi khi xử lý ảnh phim', 500));
    }
};

// Single file upload for other purposes
exports.uploadSingle = (fieldName, folder = 'cinema/general') => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: folder,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
            transformation: [{ quality: 'auto' }],
            public_id: (req, file) => {
                const timestamp = Date.now();
                const randomString = Math.random().toString(36).substring(2, 8);
                return `${fieldName}_${timestamp}_${randomString}`;
            }
        }
    });

    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = /jpeg|jpg|png|gif/;
            const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimeType = allowedTypes.test(file.mimetype);

            if (mimeType && extName) {
                return cb(null, true);
            } else {
                cb(new AppError('Chỉ chấp nhận file ảnh', 400));
            }
        }
    });

    return upload.single(fieldName);
};

// Multiple files upload
exports.uploadMultiple = (fieldName, maxCount, folder = 'cinema/general') => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: folder,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
            transformation: [{ quality: 'auto' }],
            public_id: (req, file) => {
                const timestamp = Date.now();
                const randomString = Math.random().toString(36).substring(2, 8);
                return `${fieldName}_${timestamp}_${randomString}`;
            }
        }
    });

    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB per file
            files: maxCount
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = /jpeg|jpg|png|gif/;
            const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimeType = allowedTypes.test(file.mimetype);

            if (mimeType && extName) {
                return cb(null, true);
            } else {
                cb(new AppError('Chỉ chấp nhận file ảnh', 400));
            }
        }
    });

    return upload.array(fieldName, maxCount);
};

// Error handling middleware for multer
exports.handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return next(new AppError('File quá lớn. Kích thước tối đa là 5MB', 400));
            case 'LIMIT_FILE_COUNT':
                return next(new AppError('Quá nhiều file. Vui lòng chọn ít file hơn', 400));
            case 'LIMIT_UNEXPECTED_FILE':
                return next(new AppError('Trường file không được hỗ trợ', 400));
            default:
                return next(new AppError('Lỗi upload file', 400));
        }
    }
    next(error);
};

// Utility function to delete image from Cloudinary
exports.deleteFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
            return false;
        }

        // Extract public_id from Cloudinary URL
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];
        const folder = parts[parts.length - 2];
        const fullPublicId = `${folder}/${publicId}`;

        console.log('Deleting from Cloudinary:', fullPublicId);

        const result = await cloudinary.uploader.destroy(fullPublicId);
        console.log('Cloudinary deletion result:', result);

        return result.result === 'ok';
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return false;
    }
};