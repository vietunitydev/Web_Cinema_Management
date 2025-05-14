// src/pages/admin/Movies.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService, type MovieFilters } from '../../services/movieService';
import type { Movie } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const Movies: React.FC = () => {
    // State
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<MovieFilters>({
        title: '',
        genre: '',
        status: undefined,
        page: 1,
        limit: 10,
    });
    const [genres, setGenres] = useState<string[]>([]);

    // Fetch movies based on filters
    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await movieService.getAllMovies({
                    ...filters,
                    page: currentPage,
                });

                // Update state with fetched data
                if (response.data) {
                    console.log(response.data);
                    setMovies(response.data.data);
                    setTotalItems(response.data.totalCount);
                    setTotalPages(response.data.totalPages);

                    // Extract unique genres from movies for filter
                    if (movies.length > 0 && genres.length === 0) {
                        const uniqueGenres = Array.from(
                            new Set(movies.flatMap(movie => movie.genre))
                        ).sort();
                        setGenres(uniqueGenres);
                    }
                }
            } catch {
                setError('Không thể tải danh sách phim. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [currentPage, filters]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // Handle filters change
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle search form submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            title: '',
            genre: '',
            status: undefined,
            page: 1,
            limit: 10,
        });
        setCurrentPage(1);
    };

    // Delete a movie
    const handleDeleteMovie = (id: string) => {
        confirmAlert({
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc muốn xóa phim này?',
            buttons: [
                {
                    label: 'Có',
                    onClick: async () => {
                        setActionLoading(true);
                        try {
                            await movieService.deleteMovie(id);
                            // Remove the movie from state
                            setMovies(movies.filter(movie => movie._id !== id));
                            toast.success('Xóa phim thành công');
                        } catch {
                            toast.error('Lỗi khi xóa phim');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                },
                {
                    label: 'Không',
                    onClick: () => {}
                }
            ]
        });
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý phim</h1>
                    <p className="text-gray-600">Quản lý thông tin phim trong hệ thống</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link to="/admin/movies/create">
                        <Button
                            variant="primary"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            }
                        >
                            Thêm phim mới
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <form onSubmit={handleSearch}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search by title */}
                        <div className="col-span-2">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Tìm theo tên phim
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                placeholder="Nhập tên phim..."
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={filters.title}
                                onChange={handleFilterChange}
                            />
                        </div>

                        {/* Filter by genre */}
                        <div>
                            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                                Thể loại
                            </label>
                            <select
                                id="genre"
                                name="genre"
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={filters.genre}
                                onChange={handleFilterChange}
                            >
                                <option value="">Tất cả thể loại</option>
                                {genres.map((genre) => (
                                    <option key={genre} value={genre}>
                                        {genre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter by status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Trạng thái
                            </label>
                            <select
                                id="status"
                                name="status"
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="active">Đang chiếu</option>
                                <option value="coming_soon">Sắp chiếu</option>
                                <option value="ended">Đã kết thúc</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4 space-x-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={clearFilters}
                        >
                            Xóa bộ lọc
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                        >
                            Tìm kiếm
                        </Button>
                    </div>
                </form>
            </div>

            {/* Movies Table */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-red-500">{error}</div>
                ) : movies.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        Không tìm thấy phim nào. Vui lòng thử lại với bộ lọc khác.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Phim
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Thể loại
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Thời lượng
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Ngày ra mắt
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Trạng thái
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Đánh giá
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Hành động
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {movies.map((movie) => (
                                <tr key={movie._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-12 w-8">
                                                <img
                                                    className="h-12 w-8 rounded object-cover"
                                                    src={movie.posterUrl}
                                                    alt={movie.title}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{movie.title}</div>
                                                <div className="text-xs text-gray-500 mt-1">{movie.ageRestriction}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{movie.genre.join(', ')}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{movie.duration} phút</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatDate(movie.releaseDate)}</div>
                                        {movie.endDate && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Đến {formatDate(movie.endDate)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                movie.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : movie.status === 'coming_soon'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {movie.status === 'active'
                                                    ? 'Đang chiếu'
                                                    : movie.status === 'coming_soon'
                                                        ? 'Sắp chiếu'
                                                        : 'Đã kết thúc'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="mr-1 text-sm text-gray-900">{movie.rating.toFixed(1)}</div>
                                            <svg
                                                className="h-4 w-4 text-yellow-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/admin/movies/${movie._id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Sửa
                                            </Link>
                                            <button
                                                className="text-red-600 hover:text-red-900"
                                                onClick={() => handleDeleteMovie(movie._id)}
                                                disabled={actionLoading}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && movies.length > 0 && (
                    <div className="py-4 px-6 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={totalItems}
                            itemsPerPage={filters.limit || 10}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Movies;