// src/pages/customer/MovieDetail.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { movieService } from '../../services/movieService';
// import { reviewService } from '../../services/reviewService';
import type { Movie, Review, Showtime } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const MovieDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [upcomingShowtimes, setUpcomingShowtimes] = useState<Showtime[]>([]);
    const [loading, setLoading] = useState({
        movie: true,
        reviews: true,
        showtimes: true,
    });
    const [error, setError] = useState({
        movie: null,
        reviews: null,
        showtimes: null,
    });

    // Track if trailer modal is open
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

    useEffect(() => {
        const fetchMovieData = async () => {
            if (!id) return;

            // Fetch movie details
            try {
                const response = await movieService.getMovieById(id);
                setMovie(response.data);
                setLoading((prev) => ({ ...prev, movie: false }));
            } catch (err) {
                setError((prev) => ({ ...prev, movie: 'Không thể tải thông tin phim' }));
                setLoading((prev) => ({ ...prev, movie: false }));
            }

            // Fetch movie reviews
            try {
                const response = await movieService.getMovieReviews(id);
                setReviews(response.data?.data || []);
                setLoading((prev) => ({ ...prev, reviews: false }));
            } catch (err) {
                setError((prev) => ({ ...prev, reviews: 'Không thể tải đánh giá phim' }));
                setLoading((prev) => ({ ...prev, reviews: false }));
            }

            // Fetch upcoming showtimes
            try {
                const today = new Date().toISOString().split('T')[0];
                const response = await movieService.getMovieShowtimes(id, today);
                setUpcomingShowtimes(response.data || []);
                setLoading((prev) => ({ ...prev, showtimes: false }));
            } catch (err) {
                setError((prev) => ({ ...prev, showtimes: 'Không thể tải lịch chiếu' }));
                setLoading((prev) => ({ ...prev, showtimes: false }));
            }
        };

        fetchMovieData();
    }, [id]);

    // Format rating stars
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <div className="flex">
                {Array(fullStars)
                    .fill(0)
                    .map((_, i) => (
                        <svg
                            key={`full-${i}`}
                            className="w-5 h-5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                    ))}
                {halfStar && (
                    <svg
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                )}
                {Array(emptyStars)
                    .fill(0)
                    .map((_, i) => (
                        <svg
                            key={`empty-${i}`}
                            className="w-5 h-5 text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                    ))}
            </div>
        );
    };

    // Group showtimes by date and cinema
    const groupedShowtimes = upcomingShowtimes.reduce<{
        [date: string]: {
            [cinemaId: string]: {
                cinemaName: string;
                showtimes: Showtime[];
            };
        };
    }>((acc, showtime) => {
        // Format date as key (e.g., "2023-05-14")
        const date = showtime.startTime.split('T')[0];
        const cinemaId = showtime.cinemaId;
        const cinemaName = showtime.cinema?.name || 'Rạp không xác định';

        // Initialize date group if it doesn't exist
        if (!acc[date]) {
            acc[date] = {};
        }

        // Initialize cinema group if it doesn't exist
        if (!acc[date][cinemaId]) {
            acc[date][cinemaId] = {
                cinemaName,
                showtimes: [],
            };
        }

        // Add showtime to the appropriate group
        acc[date][cinemaId].showtimes.push(showtime);

        return acc;
    }, {});

    // Status badge colors
    const statusColors = {
        active: 'bg-green-100 text-green-800',
        coming_soon: 'bg-blue-100 text-blue-800',
        ended: 'bg-gray-100 text-gray-800',
    };

    // Status text
    const statusText = {
        active: 'Đang chiếu',
        coming_soon: 'Sắp chiếu',
        ended: 'Đã kết thúc',
    };

    // Format date to readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
    };

    // Format time to readable format
    const formatTime = (timeString: string) => {
        const date = new Date(timeString);
        return format(date, 'HH:mm');
    };

    if (loading.movie) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error.movie || !movie) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    {error.movie || 'Không tìm thấy phim'}
                </h2>
                <p className="mb-8">Không thể tải thông tin phim. Vui lòng thử lại sau.</p>
                <Link to="/movies">
                    <Button variant="primary">Xem phim khác</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Movie Banner with Backdrop */}
            <div className="relative">
                <div className="h-[60vh] overflow-hidden">
                    <div
                        className="absolute inset-0 bg-center bg-cover"
                        style={{
                            backgroundImage: `url(${movie.posterUrl})`,
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    </div>
                </div>

                <div className="container mx-auto px-4 absolute inset-0 flex items-center">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Movie Poster */}
                        <div className="w-48 md:w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-xl">
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Movie Details */}
                        <div className="text-white text-center md:text-left">
              <span
                  className={`inline-block px-3 py-1 mb-4 text-xs font-medium rounded-full ${
                      statusColors[movie.status]
                  }`}
              >
                {statusText[movie.status]}
              </span>
                            <h1 className="text-3xl md:text-5xl font-bold mb-2">{movie.title}</h1>
                            <div className="flex items-center justify-center md:justify-start mb-4">
                                <div className="flex items-center">
                                    {renderStars(movie.rating)}
                                    <span className="ml-2">{movie.rating.toFixed(1)}/5</span>
                                </div>
                                <span className="mx-2">•</span>
                                <span>{movie.duration} phút</span>
                                <span className="mx-2">•</span>
                                <span>{movie.ageRestriction}</span>
                            </div>
                            <div className="mb-4">
                                <span className="font-semibold">Thể loại:</span>{' '}
                                {movie.genre.join(', ')}
                            </div>
                            <div className="mb-4">
                                <span className="font-semibold">Đạo diễn:</span>{' '}
                                {movie.director}
                            </div>
                            <div className="mb-4">
                                <span className="font-semibold">Diễn viên:</span>{' '}
                                {movie.cast.join(', ')}
                            </div>
                            <div className="mb-4">
                                <span className="font-semibold">Ngày khởi chiếu:</span>{' '}
                                {format(new Date(movie.releaseDate), 'dd/MM/yyyy')}
                            </div>
                            <div className="mb-6">
                                <span className="font-semibold">Ngôn ngữ:</span>{' '}
                                {movie.language} {movie.subtitles.length > 0 && `(Phụ đề: ${movie.subtitles.join(', ')})`}
                            </div>

                            <div className="space-x-4">
                                {movie.trailerUrl && (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        }
                                        onClick={() => setIsTrailerOpen(true)}
                                    >
                                        Xem Trailer
                                    </Button>
                                )}

                                {movie.status === 'active' && (
                                    <Link to={`/movies/${movie._id}/showtimes`}>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            icon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            }
                                        >
                                            Đặt vé ngay
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Movie Description */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Nội dung phim</h2>
                    <div className="prose max-w-none">
                        <p>{movie.description}</p>
                    </div>
                </div>

                {/* Showtimes Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Lịch chiếu</h2>

                    {loading.showtimes ? (
                        <div className="flex justify-center py-6">
                            <LoadingSpinner />
                        </div>
                    ) : error.showtimes ? (
                        <div className="text-center py-6 text-red-500">{error.showtimes}</div>
                    ) : Object.keys(groupedShowtimes).length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <p className="text-lg text-gray-600">
                                {movie.status === 'active'
                                    ? 'Hiện không có lịch chiếu nào cho phim này.'
                                    : movie.status === 'coming_soon'
                                        ? 'Phim sắp ra mắt. Lịch chiếu sẽ được cập nhật sau.'
                                        : 'Phim đã kết thúc chiếu.'}
                            </p>
                            <div className="mt-4">
                                <Link to="/movies">
                                    <Button variant="primary">Xem phim khác</Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedShowtimes).map(([date, cinemas]) => (
                                <div key={date} className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-4 text-primary capitalize">
                                        {formatDate(date)}
                                    </h3>
                                    <div className="space-y-4">
                                        {Object.values(cinemas).map((cinema) => (
                                            <div key={`${date}-${cinema.cinemaName}`} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                                                <h4 className="text-lg font-medium mb-3">{cinema.cinemaName}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {cinema.showtimes
                                                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                                        .map((showtime) => (
                                                            <Link
                                                                key={showtime._id}
                                                                to={`/showtimes/${showtime._id}/seats`}
                                                                className={`px-4 py-2 rounded-md text-center ${
                                                                    showtime.status === 'open'
                                                                        ? 'bg-white shadow hover:shadow-md border border-gray-200 transition-shadow'
                                                                        : showtime.status === 'sold_out'
                                                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                                            : 'bg-red-100 text-red-500 cursor-not-allowed'
                                                                }`}
                                                            >
                                                                <div>{formatTime(showtime.startTime)}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {showtime.format} • {showtime.language}
                                                                </div>
                                                            </Link>
                                                        ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="text-center mt-6">
                                <Link to={`/movies/${movie._id}/showtimes`}>
                                    <Button variant="primary">Xem tất cả lịch chiếu</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Đánh giá từ khách hàng</h2>
                        <Link to={`/movies/${movie._id}/reviews`}>
              <span className="text-primary hover:text-primary-dark transition-colors">
                Xem tất cả đánh giá
              </span>
                        </Link>
                    </div>

                    {loading.reviews ? (
                        <div className="flex justify-center py-6">
                            <LoadingSpinner />
                        </div>
                    ) : error.reviews ? (
                        <div className="text-center py-6 text-red-500">{error.reviews}</div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <p className="text-lg text-gray-600">
                                Chưa có đánh giá nào cho phim này.
                            </p>
                            <p className="text-gray-500 mb-4">
                                Hãy là người đầu tiên đánh giá phim này sau khi xem!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.slice(0, 3).map((review) => (
                                <div key={review._id} className="bg-gray-50 rounded-lg p-6">
                                    <div className="flex items-center mb-2">
                                        <div className="font-semibold mr-2">{review.user?.fullName || 'Người dùng ẩn danh'}</div>
                                        {renderStars(review.rating)}
                                        <span className="ml-1 text-gray-600">{review.rating.toFixed(1)}</span>
                                    </div>
                                    {review.title && (
                                        <h4 className="font-medium mb-2">{review.title}</h4>
                                    )}
                                    <p className="text-gray-700">{review.content}</p>
                                    <div className="text-sm text-gray-500 mt-2">
                                        {format(new Date(review.createdAt), 'dd/MM/yyyy')}
                                    </div>
                                </div>
                            ))}

                            <div className="text-center mt-6">
                                <Link to={`/movies/${movie._id}/reviews`}>
                                    <Button variant="outline">Xem tất cả đánh giá</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Trailer Modal */}
            {isTrailerOpen && movie.trailerUrl && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={() => setIsTrailerOpen(false)}></div>
                        <div className="relative bg-white rounded-lg overflow-hidden w-full max-w-5xl">
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={() => setIsTrailerOpen(false)}
                                    className="text-white hover:text-gray-300 transition-colors p-2 rounded-full bg-black bg-opacity-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="aspect-w-16 aspect-h-9">
                                <iframe
                                    className="w-full h-full"
                                    src={movie.trailerUrl.replace('watch?v=', 'embed/')} // Convert YouTube URL to embed format
                                    title={`${movie.title} Trailer`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieDetail;