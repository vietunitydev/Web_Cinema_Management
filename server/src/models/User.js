const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Vui lòng nhập tên đăng nhập'],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Vui lòng nhập email'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Vui lòng nhập mật khẩu'],
            minlength: 6,
            select: false,
        },
        fullName: {
            type: String,
            required: [true, 'Vui lòng nhập họ tên đầy đủ'],
        },
        phone: {
            type: String,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
        },
        address: {
            type: String,
        },
        role: {
            type: String,
            enum: ['customer', 'manager', 'admin'],
            default: 'customer',
        },
        registrationDate: {
            type: Date,
            default: Date.now,
        },
        preferences: {
            favoriteGenres: [String],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Phương thức hash mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
    console.log("register - hash before saving");
    if (!this.isModified('passwordHash')) {
        return next();
    }
    console.log("register - hash");
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    console.log("register - after hash");

    next();
});

// Phương thức so sánh mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;