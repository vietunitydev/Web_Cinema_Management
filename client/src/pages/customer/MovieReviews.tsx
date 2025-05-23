// src/pages/customer/MovieReviews.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../../services/movieService';
import { reviewService } from '../../services/reviewService';
import type { Movie, Review } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const MovieReviews: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState({
        movie: true,
        reviews: true,
    });
    const [error, setError] = useState({
        movie: null as string | null,
        reviews: null as string | null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

    useEffect(() => {
        if (!id) return;

        const fetchMovieData = async () => {
            try {
                const response = await movieService.getMovieById(id);
                setMovie(response.data);
                setLoading(prev => ({ ...prev, movie: false }));
            } catch {
                setError(prev => ({ ...prev, movie: 'Không thể tải thông tin phim' }));
                setLoading(prev => ({ ...prev, movie: false }));
            }
        };

        fetchMovieData();
    }, [id]);

    useEffect(() => {
        if (!id) return;

        const fetchReviews = async () => {
            setLoading(prev => ({ ...prev, reviews: true }));
            try {
                const response = await reviewService.getAllReviews(id, currentPage, 10);
                setReviews(response.data.data || []);
                setTotalPages(response.data.totalPages || 1);
                setLoading(prev => ({ ...prev, reviews: false }));
            } catch {
                setError(prev => ({ ...prev, reviews: 'Không thể tải đánh giá' }));
                setLoading(prev => ({ ...prev, reviews: false }));
            }
        };

        fetchReviews();
    }, [id, currentPage]);

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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <Link to="/movies">
                    <Button variant="primary">Quay lại danh sách phim</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Movie Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex items-center space-x-6">
                        <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-24 h-36 object-cover rounded-lg"
                        />
                        <div>
                            <Link
                                to={`/movies/${movie._id}`}
                                className="text-2xl font-bold text-gray-900 hover:text-primary transition-colors"
                            >
                                {movie.title}
                            </Link>
                            <div className="flex items-center mt-2">
                                {renderStars(movie.rating)}
                                <span className="ml-2 text-gray-600">
                                    {movie.rating.toFixed(1)}/5
                                </span>
                            </div>
                            <p className="text-gray-600 mt-1">
                                {movie.genre.join(', ')} • {movie.duration} phút
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reviews Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Đánh giá từ khán giả
                        </h1>
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium text-gray-700">
                                Sắp xếp theo:
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="highest">Điểm cao nhất</option>
                                <option value="lowest">Điểm thấp nhất</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                    {loading.reviews ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : error.reviews ? (
                        <div className="text-center py-8 text-red-500">
                            {error.reviews}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg
                                    className="w-16 h-16 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Chưa có đánh giá nào
                            </h3>
                            <p className="text-gray-500">
                                Hãy là người đầu tiên đánh giá bộ phim này sau khi xem!
                            </p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                                            {review.userId.fullName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">
                                                {review.userId.fullName}
                                            </h4>
                                            <div className="flex items-center space-x-2">
                                                {renderStars(review.rating)}
                                                <span className="text-sm text-gray-600">
                                                    {review.rating}/5
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                    </span>
                                </div>

                                {review.title && (
                                    <h5 className="font-medium text-gray-900 mb-2">
                                        {review.title}
                                    </h5>
                                )}

                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {review.content}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center space-x-4">
                                        <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V8a2 2 0 00-2-2H4.5a.5.5 0 01-.468-.325L3.382 4.342A1 1 0 012.553 4H1" />
                                            </svg>
                                            <span>Hữu ích ({review.likes})</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <nav className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Trước
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                                        currentPage === page
                                            ? 'text-white bg-primary border border-primary'
                                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Sau
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieReviews;