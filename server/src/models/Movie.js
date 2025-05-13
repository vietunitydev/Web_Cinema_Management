const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Vui lòng nhập tên phim'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Vui lòng nhập mô tả phim'],
        },
        duration: {
            type: Number,
            required: [true, 'Vui lòng nhập thời lượng phim'],
            min: 1,
        },
        releaseDate: {
            type: Date,
            required: [true, 'Vui lòng nhập ngày phát hành'],
        },
        endDate: {
            type: Date,
            required: [true, 'Vui lòng nhập ngày kết thúc chiếu'],
        },
        director: {
            type: String,
        },
        cast: [String],
        genre: [String],
        language: {
            type: String,
            required: [true, 'Vui lòng nhập ngôn ngữ phim'],
        },
        subtitles: [String],
        ageRestriction: {
            type: String,
            enum: ['P', 'C13', 'C16', 'C18', 'T16', 'T18'],
            default: 'P',
        },
        posterUrl: {
            type: String,
        },
        trailerUrl: {
            type: String,
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        status: {
            type: String,
            enum: ['active', 'coming_soon', 'ended'],
            default: 'coming_soon',
        },
        tags: [String],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual populate để lấy đánh giá của phim
movieSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'movieId',
    localField: '_id',
});

// Phương thức tự động cập nhật rating khi có đánh giá mới
movieSchema.statics.calcAverageRatings = async function (movieId) {
    const stats = await this.model('Review').aggregate([
        {
            $match: { movieId: new mongoose.Types.ObjectId(movieId) },
        },
        {
            $group: {
                _id: '$movieId',
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stats.length > 0) {
        await this.findByIdAndUpdate(movieId, {
            rating: stats[0].avgRating,
        });
    } else {
        await this.findByIdAndUpdate(movieId, {
            rating: 0,
        });
    }
};

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;