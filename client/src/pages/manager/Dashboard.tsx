// src/pages/manager/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { bookingService, type BookingStats } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
    const [dailyStats, setDailyStats] = useState<BookingStats | null>(null);
    const [movieStats, setMovieStats] = useState<BookingStats | null>(null);
    const [cinemaStats, setCinemaStats] = useState<BookingStats | null>(null);
    const [loading, setLoading] = useState({
        daily: true,
        movies: true,
        cinemas: true,
    });
    const [error, setError] = useState({
        daily: null,
        movies: null,
        cinemas: null,
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
            case 'month':
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                return {
                    startDate: format(startOfMonth, 'yyyy-MM-dd'),
                    endDate: format(endOfMonth, 'yyyy-MM-dd'),
                };
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
            setLoading({
                daily: true,
                movies: true,
                cinemas: true,
            });
            setError({
                daily: null,
                movies: null,
                cinemas: null,
            });

            // Fetch daily stats
            try {
                const response = await bookingService.getDailyStats(startDate, endDate);
                setDailyStats(response.data);
                setLoading((prev) => ({ ...prev, daily: false }));
            } catch (err) {
                setError((prev) => ({ ...prev, daily: 'Không thể tải dữ liệu thống kê theo ngày' }));
                setLoading((prev) => ({ ...prev, daily: false }));
            }

            // Fetch movie stats
            try {
                const response = await bookingService.getMovieStats(startDate, endDate);
                setMovieStats(response.data);
                setLoading((prev) => ({ ...prev, movies: false }));
            } catch (err) {
                setError((prev) => ({ ...prev, movies: 'Không thể tải dữ liệu thống kê theo phim' }));
                setLoading((prev) => ({ ...prev, movies: false }));
            }

            // Fetch cinema stats
            try {
                const response = await bookingService.getCinemaStats(startDate, endDate);
                setCinemaStats(response.data);
                setLoading((prev) => ({ ...prev, cinemas: false }));
            } catch (err) {
                setError((prev) => ({ ...prev, cinemas: 'Không thể tải dữ liệu thống kê theo rạp' }));
                setLoading((prev) => ({ ...prev, cinemas: false }));
            }
        };

        fetchStats();
    }, [timeRange]);

    // Format date for display
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' đ';
    };

    if (!user || user.role !== 'manager') {
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
                <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
                <p className="text-gray-600">Xem thống kê và báo cáo về rạp chiếu phim</p>
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

                {/* Average Ticket Price */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Giá vé trung bình</h3>
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
                                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
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
                            <div className="text-3xl font-bold text-gray-900">
                                {formatCurrency(dailyStats.averageTicketPrice)}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">
                                Từ {formatDate(getDateRange().startDate)} đến {formatDate(getDateRange().endDate)}
                            </p>
                        </div>
                    ) : (
                        <div className="text-gray-500">Không có dữ liệu</div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Movies */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Phim phổ biến</h3>
                    {loading.movies ? (
                        <div className="flex justify-center py-12">
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
                        <div className="flex justify-center py-12">
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

            {/* Daily Sales Chart */}
            <div className="mt-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Biểu đồ bán vé theo ngày</h3>
                    {loading.daily ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : error.daily ? (
                        <div className="text-red-500 py-4">{error.daily}</div>
                    ) : dailyStats && dailyStats.data?.length > 0 ? (
                        <div className="h-72">
                            {/* Placeholder for chart - In real implementation, use a charting library */}
                            <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg">
                                <p className="text-gray-400">Chart would be rendered here</p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-gray-500">Không có dữ liệu</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;