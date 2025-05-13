const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên rạp'],
            unique: true,
            trim: true,
        },
        location: {
            address: {
                type: String,
                required: [true, 'Vui lòng nhập địa chỉ'],
            },
            city: {
                type: String,
                required: [true, 'Vui lòng nhập thành phố'],
            },
        },
        contactInfo: {
            phone: {
                type: String,
            },
            email: {
                type: String,
            },
        },
        facilities: [String],
        openTime: {
            type: String,
            required: [true, 'Vui lòng nhập giờ mở cửa'],
        },
        closeTime: {
            type: String,
            required: [true, 'Vui lòng nhập giờ đóng cửa'],
        },
        halls: [
            {
                hallId: {
                    type: String,
                    required: [true, 'Vui lòng nhập mã phòng chiếu'],
                },
                name: {
                    type: String,
                    required: [true, 'Vui lòng nhập tên phòng chiếu'],
                },
                capacity: {
                    type: Number,
                    required: [true, 'Vui lòng nhập sức chứa'],
                    min: 1,
                },
                type: {
                    type: String,
                    enum: ['Regular', 'VIP', 'IMAX', '4DX'],
                    default: 'Regular',
                },
                seatingArrangement: {
                    rows: {
                        type: Number,
                        required: [true, 'Vui lòng nhập số hàng ghế'],
                    },
                    seatsPerRow: {
                        type: Number,
                        required: [true, 'Vui lòng nhập số ghế mỗi hàng'],
                    },
                    format: {
                        type: Array,
                        default: [],
                    },
                },
                status: {
                    type: String,
                    enum: ['active', 'maintenance', 'inactive'],
                    default: 'active',
                },
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Middleware để tự động tạo sơ đồ chỗ ngồi dựa trên số hàng và số ghế mỗi hàng
cinemaSchema.pre('save', function (next) {
    // Chỉ tạo sơ đồ chỗ ngồi nếu có thay đổi trong halls hoặc là document mới
    if (!this.isModified('halls') && !this.isNew) return next();

    this.halls.forEach((hall) => {
        if (hall.seatingArrangement.format.length === 0) {
            const format = [];
            const rows = hall.seatingArrangement.rows;
            const seatsPerRow = hall.seatingArrangement.seatsPerRow;

            // Tạo mảng chỗ ngồi cho mỗi hàng
            for (let i = 0; i < rows; i++) {
                const rowLetter = String.fromCharCode(65 + i); // A, B, C, ...
                const rowSeats = [];

                for (let j = 1; j <= seatsPerRow; j++) {
                    rowSeats.push(`${rowLetter}${j}`);
                }

                format.push(rowSeats);
            }

            hall.seatingArrangement.format = format;
        }
    });

    next();
});

const Cinema = mongoose.model('Cinema', cinemaSchema);

module.exports = Cinema;