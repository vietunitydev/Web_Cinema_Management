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
            default: 'Cash',
        },
        paymentId: {
            type: String,
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
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Middleware để tự động tạo mã đặt vé
bookingSchema.pre('save', function (next) {
    if (this.isNew) {
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

// Middleware để cập nhật danh sách ghế trống và đã đặt
bookingSchema.post('save', async function () {
    try {
        if (this.status === 'confirmed' || this.status === 'completed') {
            const showtime = await mongoose.model('Showtime').findById(this.showtimeId);

            // Cập nhật danh sách ghế đã đặt và ghế còn trống
            showtime.bookedSeats = [...showtime.bookedSeats, ...this.seats];
            showtime.availableSeats = showtime.availableSeats.filter(
                (seat) => !this.seats.includes(seat)
            );

            await showtime.save();
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật ghế ngồi:', error);
    }
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
        });

    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;