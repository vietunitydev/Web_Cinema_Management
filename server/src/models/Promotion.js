const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên khuyến mãi'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Vui lòng nhập mô tả khuyến mãi'],
        },
        type: {
            type: String,
            enum: ['percentage', 'fixed_amount', 'buy_one_get_one'],
            required: [true, 'Vui lòng chọn loại khuyến mãi'],
        },
        value: {
            type: Number,
            required: [true, 'Vui lòng nhập giá trị khuyến mãi'],
            min: 0,
        },
        minPurchase: {
            type: Number,
            default: 0,
        },
        maxDiscount: {
            type: Number,
            default: 0,
        },
        startDate: {
            type: Date,
            required: [true, 'Vui lòng nhập ngày bắt đầu'],
        },
        endDate: {
            type: Date,
            required: [true, 'Vui lòng nhập ngày kết thúc'],
        },
        applicableMovies: {
            type: [String],
            default: ['all'],
        },
        applicableCinemas: {
            type: [String],
            default: ['all'],
        },
        applicableDaysOfWeek: {
            type: [String],
            default: ['all'],
            validate: {
                validator: function(days) {
                    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'all'];
                    return days.every(day => validDays.includes(day));
                },
                message: 'Ngày trong tuần không hợp lệ'
            }
        },
        couponCode: {
            type: String,
            required: [true, 'Vui lòng nhập mã khuyến mãi'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        usageLimit: {
            type: Number,
            required: [true, 'Vui lòng nhập giới hạn sử dụng'],
            min: 0,
        },
        usageCount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['active', 'upcoming', 'expired'],
            default: 'upcoming',
        },
    },
    {
        timestamps: true,
    }
);

// Middleware để tự động cập nhật trạng thái khuyến mãi dựa vào ngày
promotionSchema.pre('save', function (next) {
    const now = new Date();

    if (now < this.startDate) {
        this.status = 'upcoming';
    } else if (now > this.endDate) {
        this.status = 'expired';
    } else {
        this.status = 'active';
    }

    next();
});

// Phương thức kiểm tra xem khuyến mãi có áp dụng được cho đơn hàng không
promotionSchema.methods.isApplicable = function (orderDetails) {
    const { totalAmount, movieId, cinemaId, date } = orderDetails;

    // Kiểm tra trạng thái khuyến mãi
    if (this.status !== 'active') {
        return false;
    }

    // Kiểm tra giá trị tối thiểu của đơn hàng
    if (totalAmount < this.minPurchase) {
        return false;
    }

    // Kiểm tra số lần sử dụng
    if (this.usageCount >= this.usageLimit) {
        return false;
    }

    // Kiểm tra ngày đặt vé có áp dụng không
    const orderDay = new Date(date).toLocaleString('en-us', { weekday: 'long' });
    if (
        !this.applicableDaysOfWeek.includes('all') &&
        !this.applicableDaysOfWeek.includes(orderDay)
    ) {
        return false;
    }

    // Kiểm tra phim có áp dụng không
    if (
        !this.applicableMovies.includes('all') &&
        !this.applicableMovies.includes(movieId.toString())
    ) {
        return false;
    }

    // Kiểm tra rạp có áp dụng không
    if (
        !this.applicableCinemas.includes('all') &&
        !this.applicableCinemas.includes(cinemaId.toString())
    ) {
        return false;
    }

    return true;
};

// Phương thức tính toán số tiền giảm
promotionSchema.methods.calculateDiscount = function (totalAmount) {
    let discount = 0;

    switch (this.type) {
        case 'percentage':
            discount = (totalAmount * this.value) / 100;
            break;
        case 'fixed_amount':
            discount = this.value;
            break;
        case 'buy_one_get_one':
            // Logic for buy one get one would depend on specific requirements
            break;
        default:
            discount = 0;
    }

    // Kiểm tra giới hạn giảm giá tối đa
    if (this.maxDiscount > 0 && discount > this.maxDiscount) {
        discount = this.maxDiscount;
    }

    return discount;
};

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;