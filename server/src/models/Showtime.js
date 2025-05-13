const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
    {
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
        startTime: {
            type: Date,
            required: [true, 'Vui lòng nhập thời gian bắt đầu'],
        },
        endTime: {
            type: Date,
            required: [true, 'Vui lòng nhập thời gian kết thúc'],
        },
        language: {
            type: String,
            required: [true, 'Vui lòng nhập ngôn ngữ phát'],
        },
        subtitles: [String],
        format: {
            type: String,
            enum: ['2D', '3D', 'IMAX', '4DX'],
            default: '2D',
        },
        price: {
            regular: {
                type: Number,
                required: [true, 'Vui lòng nhập giá vé thường'],
                min: 0,
            },
            vip: {
                type: Number,
                required: [true, 'Vui lòng nhập giá vé VIP'],
                min: 0,
            },
            student: {
                type: Number,
                min: 0,
            },
        },
        availableSeats: [String],
        bookedSeats: [String],
        status: {
            type: String,
            enum: ['open', 'canceled', 'sold-out', 'closed'],
            default: 'open',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Lấy thông tin phim và rạp khi query showtime
showtimeSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'movieId',
        select: 'title duration posterUrl',
    }).populate({
        path: 'cinemaId',
        select: 'name location halls',
    });
    next();
});

// Kiểm tra xem suất chiếu có đang diễn ra không
showtimeSchema.methods.isOngoing = function () {
    const now = new Date();
    return now >= this.startTime && now <= this.endTime;
};

// Kiểm tra xem ghế có khả dụng không
showtimeSchema.methods.isSeatAvailable = function (seatNumber) {
    return this.availableSeats.includes(seatNumber);
};

// Middleware để tự động cập nhật availableSeats dựa trên sơ đồ chỗ ngồi của phòng
showtimeSchema.pre('save', async function (next) {
    if (!this.isNew) return next();

    try {
        const cinema = await mongoose.model('Cinema').findById(this.cinemaId);
        const hall = cinema.halls.find((h) => h.hallId === this.hallId);

        if (!hall) {
            throw new Error('Không tìm thấy phòng chiếu');
        }

        const allSeats = [];
        hall.seatingArrangement.format.forEach((row) => {
            allSeats.push(...row);
        });

        this.availableSeats = allSeats;
        this.bookedSeats = [];

        next();
    } catch (error) {
        next(error);
    }
});

const Showtime = mongoose.model('Showtime', showtimeSchema);

module.exports = Showtime;