const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Đánh giá phải thuộc về một người dùng'],
        },
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            required: [true, 'Đánh giá phải thuộc về một bộ phim'],
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: [true, 'Đánh giá phải thuộc về một đơn đặt vé'],
        },
        rating: {
            type: Number,
            required: [true, 'Vui lòng cung cấp đánh giá'],
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Đánh giá không thể trống'],
            trim: true,
        },
        likes: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Đảm bảo người dùng chỉ có thể đánh giá một bộ phim một lần
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// Populate thông tin người dùng và phim
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'userId',
        select: 'fullName',
    }).populate({
        path: 'movieId',
        select: 'title',
    });

    next();
});

// Phương thức kiểm tra xem người dùng đã xem phim chưa thông qua booking
reviewSchema.statics.hasViewedMovie = async function (userId, movieId) {
    const booking = await mongoose.model('Booking').findOne({
        userId,
        movieId,
        status: { $in: ['confirmed', 'completed'] },
    });

    return !!booking;
};

// Middleware để cập nhật rating trung bình của phim sau khi lưu đánh giá
reviewSchema.post('save', async function () {
    await this.constructor.model('Movie').calcAverageRatings(this.movieId);
});

// Middleware để cập nhật rating trung bình của phim sau khi xóa đánh giá
reviewSchema.post('remove', async function () {
    await this.constructor.model('Movie').calcAverageRatings(this.movieId);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;