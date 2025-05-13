const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Xử lý uncaught exception
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

// Cấu hình biến môi trường
dotenv.config({ path: './.env' });

// Import app Express
// Kết nối đến MongoDB
const connectDB = require('./config/db');
const app = require("./app");
connectDB();

// Khởi động server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Xử lý unhandled rejection
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Xử lý SIGTERM
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});