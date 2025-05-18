// src/pages/manager/Showtimes.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { showtimeService, type ShowtimeFilters } from '../../services/showtimeService';
import { movieService } from '../../services/movieService';
import { cinemaService } from '../../services/cinemaService';
import type {Movie, Cinema, MovieOption, CinemaOption, ShowtimeResponse} from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';

interface ErrorState {
    showtimes: string | null;
    movieOptions: string | null;
    cinemaOptions: string | null;
    details: string | null;
}

const Showtimes: React.FC = () => {
    const [showtimes, setShowtimes] = useState<ShowtimeResponse[]>([]);
    const [movieOptions, setMovieOptions] = useState<MovieOption[]>([]);
    const [cinemaOptions, setCinemaOptions] = useState<CinemaOption[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState({
        showtimes: true,
        options: true,
        details: false,
        action: false,
    });
    const [error, setError] = useState<ErrorState>({
        showtimes: null,
        movieOptions: null,
        cinemaOptions: null,
        details: null,
    });
    const [filters, setFilters] = useState<ShowtimeFilters>({
        movie: '',
        cinema: '',
        date: new Date().toISOString().split('T')[0],
        status: undefined,
        page: 1,
        limit: 10,
    });

    // Fetch dữ liệu options cho dropdown
    useEffect(() => {
        const fetchOptions = async () => {
            setLoading((prev) => ({ ...prev, options: true }));
            try {
                // Fetch tất cả options cho dropdown (chỉ lấy id và tên)
                const [movieOptionsResponse, cinemaOptionsResponse] = await Promise.all([
                    movieService.getMovieOptions(),
                    cinemaService.getCinemaOptions(),
                ]);

                setMovieOptions(movieOptionsResponse.data || []);
                setCinemaOptions(cinemaOptionsResponse.data || []);

                setError((prev) => ({
                    ...prev,
                    movieOptions: null,
                    cinemaOptions: null,
                }));
            } catch {
                setError((prev) => ({
                    ...prev,
                    movieOptions: 'Không thể tải danh sách phim',
                    cinemaOptions: 'Không thể tải danh sách rạp',
                }));
            } finally {
                setLoading((prev) => ({ ...prev, options: false }));
            }
        };

        fetchOptions();
    }, []);

    // Fetch showtimes
    useEffect(() => {
        const fetchShowtimes = async () => {
            setLoading((prev) => ({ ...prev, showtimes: true }));
            try {
                const response = await showtimeService.getAllShowtimes({
                    ...filters,
                    page: currentPage,
                });

                // console.log(response);

                setShowtimes(response.data?.data || []);
                setTotalItems(response.data?.totalCount || 0);
                setTotalPages(response.data?.totalPages || 1);
                setError((prev) => ({ ...prev, showtimes: null }));
            } catch {
                setError((prev) => ({ ...prev, showtimes: 'Không thể tải danh sách lịch chiếu' }));
            } finally {
                setLoading((prev) => ({ ...prev, showtimes: false }));
            }
        };

        fetchShowtimes();
    }, [currentPage, filters]);

    // Handle filter changes
    const handleFilterChange = (name: string, value: string) => {
        setFilters({
            ...filters,
            [name]: value,
        });
        setCurrentPage(1);
    };

    // Handle date change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({
            ...filters,
            date: e.target.value,
        });
        setCurrentPage(1);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // Handle cancelation of a showtime
    const handleCancelShowtime = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn hủy lịch chiếu này?')) {
            setLoading((prev) => ({ ...prev, action: true }));
            try {
                await showtimeService.cancelShowtime(id);
                // Update the showtime in the list
                setShowtimes(
                    showtimes.map((showtime) =>
                        showtime._id === id ? { ...showtime, status: 'canceled' } : showtime
                    )
                );
                toast.success('Lịch chiếu đã được hủy thành công');
            } catch {
                toast.error('Không thể hủy lịch chiếu. Vui lòng thử lại.');
            } finally {
                setLoading((prev) => ({ ...prev, action: false }));
            }
        }
    };

    // Handle deletion of a showtime
    const handleDeleteShowtime = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa lịch chiếu này? Hành động này không thể hoàn tác.')) {
            setLoading((prev) => ({ ...prev, action: true }));
            try {
                await showtimeService.deleteShowtime(id);
                // Remove the showtime from the list
                setShowtimes(showtimes.filter((showtime) => showtime._id !== id));
                toast.success('Lịch chiếu đã được xóa thành công');
            } catch {
                toast.error('Không thể xóa lịch chiếu. Vui lòng thử lại.');
            } finally {
                setLoading((prev) => ({ ...prev, action: false }));
            }
        }
    };

    // Format date and time
    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return format(date, 'HH:mm - dd/MM/yyyy', { locale: vi });
    };

    // Get status badge class
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'canceled':
                return 'bg-red-100 text-red-800';
            case 'sold_out':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'open':
                return 'Đang mở';
            case 'canceled':
                return 'Đã hủy';
            case 'sold_out':
                return 'Hết vé';
            default:
                return 'Không xác định';
        }
    };

    // Check if any filter is active
    const isFilterActive = () => {
        return filters.movie !== '' || filters.cinema !== '' || filters.status !== undefined;
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            movie: '',
            cinema: '',
            date: new Date().toISOString().split('T')[0],
            status: undefined,
            page: 1,
            limit: 10,
        });
        setCurrentPage(1);
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý lịch chiếu</h1>
                    <p className="text-gray-600">Quản lý lịch chiếu phim tại các rạp</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link to="/manager/showtimes/create">
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
                            Thêm lịch chiếu
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                    {/* Date Filter */}
                    <div className="flex-1">
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày chiếu
                        </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={filters.date}
                            onChange={handleDateChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Movie Filter */}
                    <div className="flex-1">
                        <label htmlFor="movie" className="block text-sm font-medium text-gray-700 mb-1">
                            Phim
                        </label>
                        <select
                            id="movie"
                            name="movie"
                            value={filters.movie}
                            onChange={(e) => handleFilterChange('movie', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={loading.options}
                        >
                            <option value="">Tất cả phim</option>
                            {movieOptions.map((movie) => (
                                <option key={movie._id} value={movie._id}>
                                    {movie.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Cinema Filter */}
                    <div className="flex-1">
                        <label htmlFor="cinema" className="block text-sm font-medium text-gray-700 mb-1">
                            Rạp
                        </label>
                        <select
                            id="cinema"
                            name="cinema"
                            value={filters.cinema}
                            onChange={(e) => handleFilterChange('cinema', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={loading.options}
                        >
                            <option value="">Tất cả rạp</option>
                            {cinemaOptions.map((cinema) => (
                                <option key={cinema._id} value={cinema._id}>
                                    {cinema.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex-1">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={filters.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="open">Đang mở</option>
                            <option value="canceled">Đã hủy</option>
                            <option value="sold_out">Hết vé</option>
                        </select>
                    </div>

                    {/* Clear Filter Button */}
                    <div className="flex-shrink-0">
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            disabled={!isFilterActive()}
                            className={`mt-6 ${!isFilterActive() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Xóa bộ lọc
                        </Button>
                    </div>
                </div>
            </div>

            {/* Showtimes Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading.showtimes ? (
                    <div className="p-8 flex justify-center">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error.showtimes ? (
                    <div className="p-8 text-center text-red-500">{error.showtimes}</div>
                ) : showtimes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Không tìm thấy lịch chiếu nào {isFilterActive() && 'phù hợp với bộ lọc'}
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
                                    Rạp
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Phòng
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Thời gian
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Định dạng
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
                                    Hành động
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {showtimes.map((showtime) => (
                                <tr key={showtime._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {showtime.movieId.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {showtime.cinemaId.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{showtime.hallId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatDateTime(showtime.startTime)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{showtime.format}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                              showtime.status
                          )}`}
                      >
                        {getStatusText(showtime.status)}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link to={`/manager/showtimes/${showtime._id}/edit`}>
                                                <button className="text-indigo-600 hover:text-indigo-900">Sửa</button>
                                            </Link>
                                            {showtime.status !== 'canceled' && (
                                                <button
                                                    onClick={() => handleCancelShowtime(showtime._id)}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    disabled={loading.action}
                                                >
                                                    Hủy
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteShowtime(showtime._id)}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={loading.action}
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
            </div>

            {/* Pagination */}
            {!loading.showtimes && showtimes.length > 0 && (
                <div className="mt-6">
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
    );
};

export default Showtimes;