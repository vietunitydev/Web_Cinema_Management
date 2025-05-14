const jwt = require('jsonwebtoken');

// Tạo JWT token cho người dùng
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Tạo và gửi token trong cookie
const sendToken = (user, statusCode, res) => {
    // Tạo JWT token
    const token = generateToken(user._id);

    // Thiết lập cookie options
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true, // Cookie không thể truy cập bởi JavaScript
    };

    // Thêm secure nếu là môi trường production
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true; // Cookie chỉ gửi qua HTTPS
    }

    // Gửi cookie chứa token
    res.cookie('jwt', token, cookieOptions);

    // Xóa mật khẩu từ output
    user.passwordHash = undefined;

    // Trả về response
    res.status(statusCode).json({
        status: 'success',
        data: {
            user,
            token,
        },
    });
};

module.exports = { generateToken, sendToken };