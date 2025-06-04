const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/appError');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const cinemaRoutes = require('./routes/cinemaRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const verifyRoutes = require('./routes/verifyRoutes');

// Khởi tạo app Express
const app = express();

// Cấu hình CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Các middleware bảo mật
app.use(helmet()); // Thiết lập các HTTP headers bảo mật

// Giới hạn request từ một IP
// const limiter = rateLimit({
//     max: 100, // Số lượng request tối đa
//     windowMs: 60 * 60 * 1000, // Khoảng thời gian: 1 giờ
//     message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 1 giờ!'
// });
// app.use('/api', limiter);

// Middleware phân tích body request
app.use(express.json({ limit: '10kb' })); // Giới hạn kích thước JSON
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Bảo vệ khỏi tấn công NoSQL Injection
app.use(mongoSanitize());

// Bảo vệ khỏi tấn công XSS
app.use(xss());

// Middleware nén response
app.use(compression());

// Middleware log request trong môi trường development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/verify', promotionRoutes);

// Route mặc định cho API
app.get('/api', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Cinema Management API!'
    });
});

// Xử lý route không tồn tại
app.all('*', (req, res, next) => {
    next(new AppError(`Không tìm thấy ${req.originalUrl} trên server!`, 404));
});

// Middleware xử lý lỗi
app.use(errorHandler);

module.exports = app;