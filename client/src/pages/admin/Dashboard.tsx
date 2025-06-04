// src/pages/admin/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { bookingService, type BookingStats } from '../../services/bookingService';
import { movieService } from '../../services/movieService';
import { userService } from '../../services/userService';
import type { Movie, User } from '../../types/models';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

interface ErrorState {
    daily: string | null;
    movies: string | null;
    cinemas: string | null;
    recentMovies: string | null;
    recentUsers: string | null;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
    const [dailyStats, setDailyStats] = useState<BookingStats | null>(null);
    const [movieStats, setMovieStats] = useState<BookingStats | null>(null);
    const [cinemaStats, setCinemaStats] = useState<BookingStats | null>(null);
    const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState({
        daily: true,
        movies: true,
        cinemas: true,
        recentMovies: true,
        recentUsers: true
    });
    const [error, setError] = useState<ErrorState>({
        daily: null,
        movies: null,
        cinemas: null,
        recentMovies: null,
        recentUsers: null
    });

    // Get date range based on selected time range
    const getDateRange = () => {
        const today = new Date();

        switch (timeRange) {
            case 'day':
                return {
                    startDate: format(today, 'yyyy-MM-dd'),
                    endDate: format(today, 'yyyy-MM-dd'),
                };
            case 'week':
                return {
                    startDate: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                    endDate: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                };
            case 'month':{
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                return {
                    startDate: format(startOfMonth, 'yyyy-MM-dd'),
                    endDate: format(endOfMonth, 'yyyy-MM-dd'),
                };
            }

            default:
                return {
                    startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
                    endDate: format(today, 'yyyy-MM-dd'),
                };
        }
    };

    // Fetch statistics when time range changes
    useEffect(() => {
        const fetchStats = async () => {
            const { startDate, endDate } = getDateRange();

            // Reset loading and error states
            setLoading(prev => ({
                ...prev,
                daily: true,
                movies: true,
                cinemas: true
            }));
            setError(prev => ({
                ...prev,
                daily: null,
                movies: null,
                cinemas: null
            }));

            // Fetch daily stats
            try {
                const response = await bookingService.getDailyStats(startDate, endDate);
                setDailyStats(response.data ?? null);
                setLoading((prev) => ({ ...prev, daily: false }));
            } catch {
                setError((prev) => ({ ...prev, daily: 'Không thể tải dữ liệu thống kê theo ngày' }));
                setLoading((prev) => ({ ...prev, daily: false }));
            }

            // Fetch movie stats
            try {
                const response = await bookingService.getMovieStats(startDate, endDate);
                console.log(response.data);
                setMovieStats(response.data ?? null);
                setLoading((prev) => ({ ...prev, movies: false }));
            } catch {
                setError((prev) => ({ ...prev, movies: 'Không thể tải dữ liệu thống kê theo phim' }));
                setLoading((prev) => ({ ...prev, movies: false }));
            }

            // Fetch cinema stats
            try {
                const response = await bookingService.getCinemaStats(startDate, endDate);
                setCinemaStats(response.data ?? null);
                setLoading((prev) => ({ ...prev, cinemas: false }));
            } catch {
                setError((prev) => ({ ...prev, cinemas: 'Không thể tải dữ liệu thống kê theo rạp' }));
                setLoading((prev) => ({ ...prev, cinemas: false }));
            }
        };

        fetchStats();
    }, [timeRange]);

    // Fetch recent data on component mount
    useEffect(() => {
        const fetchRecentData = async () => {
            // Fetch recent movies
            try {
                const response = await movieService.getAllMovies({ limit: 5, sort: '-_id' });
                setRecentMovies(response.data?.data || []);
                setLoading(prev => ({ ...prev, recentMovies: false }));
            } catch {
                setError(prev => ({ ...prev, recentMovies: 'Không thể tải danh sách phim mới nhất' }));
                setLoading(prev => ({ ...prev, recentMovies: false }));
            }

            // Fetch recent users
            try {
                const response = await userService.getAllUsers(1, 5);
                setRecentUsers(response.data?.data || []);
                setLoading(prev => ({ ...prev, recentUsers: false }));
            } catch {
                setError(prev => ({ ...prev, recentUsers: 'Không thể tải danh sách người dùng mới nhất' }));
                setLoading(prev => ({ ...prev, recentUsers: false }));
            }
        };

        fetchRecentData();
    }, []);

    // Format date for display
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        if (typeof amount !== 'number') return '0 đ';
        return amount.toLocaleString('vi-VN') + ' đ';
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Không có quyền truy cập</h2>
                    <p className="text-gray-600">Bạn không có quyền truy cập vào trang này.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
                <p className="text-gray-600">Xem thống kê và báo cáo toàn hệ thống</p>
            </div>

            {/* Time Range Selector */}
            <div className="mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-3">Chọn khoảng thời gian</h2>
                    <div className="flex space-x-2">
                        <button
                            className={`px-4 py-2 rounded-md ${
                                timeRange === 'day'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => setTimeRange('day')}
                        >
                            Hôm nay
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${
                                timeRange === 'week'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => setTimeRange('week')}
                        >
                            Tuần này
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${
                                timeRange === 'month'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => setTimeRange('month')}
                        >
                            Tháng này
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistic Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Tổng doanh thu</h3>
                        <div className="p-2 bg-blue-100 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                    {loading.daily ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : error.daily ? (
                        <div className="text-red-500 text-sm">{error.daily}</div>
                    ) : dailyStats ? (
                        <div>
                            <div className="text-3xl font-bold text-gray-900">{formatCurrency(dailyStats.totalRevenue)}</div>
                            <p className="text-gray-500 text-sm mt-1">
                                Từ {formatDate(getDateRange().startDate)} đến {formatDate(getDateRange().endDate)}
                            </p>
                        </div>
                    ) : (
                        <div className="text-gray-500">Không có dữ liệu</div>
                    )}
                </div>

                {/* Tickets Sold */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Vé đã bán</h3>
                        <div className="p-2 bg-green-100 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                />
                            </svg>
                        </div>
                    </div>
                    {loading.daily ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : error.daily ? (
                        <div className="text-red-500 text-sm">{error.daily}</div>
                    ) : dailyStats ? (
                        <div>
                            <div className="text-3xl font-bold text-gray-900">{dailyStats.ticketsSold}</div>
                            <p className="text-gray-500 text-sm mt-1">
                                Từ {formatDate(getDateRange().startDate)} đến {formatDate(getDateRange().endDate)}
                            </p>
                        </div>
                    ) : (
                        <div className="text-gray-500">Không có dữ liệu</div>
                    )}
                </div>

                {/* Users */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Người dùng</h3>
                        <div className="p-2 bg-purple-100 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-purple-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                        </div>
                    </div>
                    {loading.recentUsers ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : error.recentUsers ? (
                        <div className="text-red-500 text-sm">{error.recentUsers}</div>
                    ) : (
                        <div>
                            <div className="text-3xl font-bold text-gray-900">{recentUsers.length}</div>
                            <p className="text-gray-500 text-sm mt-1">
                                Người dùng mới nhất
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Movies */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Phim mới nhất</h3>
                        <Link to="/admin/movies" className="text-primary hover:text-primary-dark text-sm font-medium">
                            Xem tất cả
                        </Link>
                    </div>

                    {loading.recentMovies ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : error.recentMovies ? (
                        <div className="text-red-500 text-sm">{error.recentMovies}</div>
                    ) : recentMovies.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Không có phim nào</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phim
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thể loại
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Đánh giá
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {recentMovies.map((movie) => (
                                    <tr key={movie._id}>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-md object-cover"
                                                        src={movie.posterUrl}
                                                        alt={movie.title}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{movie.title}</div>
                                                    <div className="text-sm text-gray-500">{movie.duration} phút</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{movie.genre.join(', ')}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {movie.rating.toFixed(1)} ⭐️
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Recent Users */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Người dùng mới nhất</h3>
                        <Link to="/admin/users" className="text-primary hover:text-primary-dark text-sm font-medium">
                            Xem tất cả
                        </Link>
                    </div>

                    {loading.recentUsers ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : error.recentUsers ? (
                        <div className="text-red-500 text-sm">{error.recentUsers}</div>
                    ) : recentUsers.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Không có người dùng nào</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Họ tên
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vai trò
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày đăng ký
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {recentUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                            <div className="text-xs text-gray-500">@{user.username}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    user.role === 'admin'
                                                        ? 'bg-red-100 text-red-800'
                                                        : user.role === 'manager'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {user.role === 'admin'
                                                        ? 'Quản trị viên'
                                                        : user.role === 'manager'
                                                            ? 'Quản lý rạp'
                                                            : 'Khách hàng'}
                                                </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(user.registrationDate)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Movies */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Phim phổ biến</h3>
                    {loading.movies ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner />
                        </div>
                    ) : error.movies ? (
                        <div className="text-red-500 py-4">{error.movies}</div>
                    ) : movieStats && movieStats.data?.length > 0 ? (
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
                                        Số vé
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Doanh thu
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {movieStats.data.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((stat, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {stat.movieId || 'Không xác định'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{stat.count}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatCurrency(stat.revenue)}</div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-gray-500">Không có dữ liệu</div>
                    )}
                </div>

                {/* Cinema Performance */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Hiệu suất rạp</h3>
                    {loading.cinemas ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner />
                        </div>
                    ) : error.cinemas ? (
                        <div className="text-red-500 py-4">{error.cinemas}</div>
                    ) : cinemaStats && cinemaStats.data?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
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
                                        Số vé
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Doanh thu
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {cinemaStats.data.sort((a, b) => b.revenue - a.revenue).map((stat, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {stat.cinemaId || 'Không xác định'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{stat.count}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatCurrency(stat.revenue)}</div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-gray-500">Không có dữ liệu</div>
                    )}
                </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link to="/admin/movies/create">
                    <Button
                        variant="primary"
                        fullWidth
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        }
                    >
                        Thêm phim mới
                    </Button>
                </Link>
                <Link to="/admin/users/create">
                    <Button
                        variant="secondary"
                        fullWidth
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                            </svg>
                        }
                    >
                        Thêm người dùng
                    </Button>
                </Link>
                <Link to="/admin/promotions/create">
                    <Button
                        variant="outline"
                        fullWidth
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                            </svg>
                        }
                    >
                        Thêm khuyến mãi
                    </Button>
                </Link>
                <Link to="/admin/reports">
                    <Button
                        variant="outline"
                        fullWidth
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        }
                    >
                        Xem báo cáo
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;