const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Vui lòng chọn người dùng'],
        },
        showtimeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Showtime',
            required: [true, 'Vui lòng chọn suất chiếu'],
        },
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            required: [true, 'Vui lòng chọn phim'],
        },
        cinemaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cinema',
            required: [true, 'Vui lòng chọn rạp'],
        },
        hallId: {
            type: String,
            required: [true, 'Vui lòng chọn phòng chiếu'],
        },
        bookingTime: {
            type: Date,
            default: Date.now,
        },
        seats: {
            type: [String],
            required: [true, 'Vui lòng chọn ít nhất một ghế'],
            validate: {
                validator: function (seats) {
                    return seats.length > 0;
                },
                message: 'Vui lòng chọn ít nhất một ghế',
            },
        },
        totalAmount: {
            type: Number,
            required: [true, 'Vui lòng nhập tổng tiền'],
            min: 0,
        },
        discount: {
            promotionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Promotion',
            },
            amount: {
                type: Number,
                default: 0,
            },
        },
        finalAmount: {
            type: Number,
            required: [true, 'Vui lòng nhập số tiền cuối cùng'],
            min: 0,
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Credit Card', 'MoMo', 'Zalopay', 'Banking'],
            required: [true, 'Vui lòng chọn phương thức thanh toán'],
        },
        paymentId: {
            type: String,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            default: 'pending',
        },
        isRefunded: {
            type: Boolean,
            default: false,
        },
        bookingCode: {
            type: String,
            unique: true,
        },
        expiresAt: {
            type: Date,
            // Đặt vé hết hạn sau 15 phút nếu chưa thanh toán (chỉ áp dụng cho pending bookings)
            default: function() {
                if (this.paymentMethod === 'Cash') {
                    return new Date(Date.now() + 15 * 60 * 1000); // 15 phút
                }
                return null;
            }
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Middleware để tự động tạo mã đặt vé
bookingSchema.pre('save', function (next) {
    if (this.isNew && !this.bookingCode) {
        // Tạo một mã đặt vé gồm 8 ký tự: 3 chữ cái + 5 số
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let code = '';

        // Thêm 3 chữ cái ngẫu nhiên
        for (let i = 0; i < 3; i++) {
            code += letters.charAt(Math.floor(Math.random() * letters.length));
        }

        // Thêm 5 số ngẫu nhiên
        for (let i = 0; i < 5; i++) {
            code += Math.floor(Math.random() * 10);
        }

        this.bookingCode = code;
    }
    next();
});

// Middleware để xử lý khi booking hết hạn
bookingSchema.pre('remove', async function() {
    try {
        // Trả lại ghế về available seats khi booking bị xóa do hết hạn
        if (this.status === 'pending') {
            const showtime = await mongoose.model('Showtime').findById(this.showtimeId);
            if (showtime) {
                showtime.availableSeats = [...new Set([...showtime.availableSeats, ...this.seats])];
                showtime.bookedSeats = showtime.bookedSeats.filter(seat => !this.seats.includes(seat));
                await showtime.save();
            }
        }
    } catch (error) {
        console.error('Lỗi khi trả lại ghế ngồi:', error);
    }
});

// Middleware để cập nhật danh sách ghế trống và đã đặt khi booking được confirm
bookingSchema.post('save', async function (doc, next) {
    try {
        // Chỉ cập nhật khi status thay đổi thành confirmed hoặc completed
        if (this.isModified('status') && (this.status === 'confirmed' || this.status === 'completed')) {
            const showtime = await mongoose.model('Showtime').findById(this.showtimeId);

            if (showtime) {
                // Đảm bảo ghế được chuyển từ available sang booked
                showtime.availableSeats = showtime.availableSeats.filter(seat => !this.seats.includes(seat));
                showtime.bookedSeats = [...new Set([...showtime.bookedSeats, ...this.seats])];
                await showtime.save();
            }
        }

        // Nếu booking bị hủy, trả lại ghế
        if (this.isModified('status') && this.status === 'cancelled') {
            const showtime = await mongoose.model('Showtime').findById(this.showtimeId);

            if (showtime) {
                showtime.availableSeats = [...new Set([...showtime.availableSeats, ...this.seats])];
                showtime.bookedSeats = showtime.bookedSeats.filter(seat => !this.seats.includes(seat));
                await showtime.save();
            }
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật ghế ngồi:', error);
    }
    next();
});

// Populate thông tin liên quan khi query
bookingSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'userId',
        select: 'fullName email phone',
    })
        .populate({
            path: 'showtimeId',
            select: 'startTime endTime language format',
        })
        .populate({
            path: 'movieId',
            select: 'title posterUrl',
        })
        .populate({
            path: 'cinemaId',
            select: 'name location',
        })
        .populate({
            path: 'discount.promotionId',
            select: 'name couponCode',
        });

    next();
});

// Virtual để kiểm tra booking có hết hạn không
bookingSchema.virtual('isExpired').get(function() {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

// Virtual để tính thời gian còn lại
bookingSchema.virtual('timeRemaining').get(function() {
    if (!this.expiresAt || this.status !== 'pending') return null;
    const remaining = this.expiresAt - new Date();
    return remaining > 0 ? remaining : 0;
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;