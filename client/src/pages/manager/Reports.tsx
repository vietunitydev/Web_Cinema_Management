// src/pages/manager/Reports.tsx
import React, { useState, useEffect } from 'react';
import { bookingService, type BookingStats } from '../../services/bookingService';
import { movieService } from '../../services/movieService';
import type { Movie } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const Reports: React.FC = () => {
    // State for date range
    const [dateRange, setDateRange] = useState({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
    });

    // State for report type
    const [reportType, setReportType] = useState<'daily' | 'movie' | 'cinema'>('daily');

    // State for report data
    const [reportData, setReportData] = useState<BookingStats | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load movie data for display names
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await movieService.getAllMovies();
                setMovies(response.data?.data || []);
            } catch (err) {
                console.error('Failed to fetch movies', err);
            }
        };

        fetchMovies();
    }, []);

    // Generate report when parameters change
    useEffect(() => {
        const generateReport = async () => {
            setLoading(true);
            setError(null);

            try {
                let response;
                switch (reportType) {
                    case 'daily':
                        response = await bookingService.getDailyStats(dateRange.startDate, dateRange.endDate);
                        break;
                    case 'movie':
                        response = await bookingService.getMovieStats(dateRange.startDate, dateRange.endDate);
                        break;
                    case 'cinema':
                        response = await bookingService.getCinemaStats(dateRange.startDate, dateRange.endDate);
                        break;
                }
                setReportData(response.data);
            } catch (err) {
                setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        generateReport();
    }, [reportType, dateRange.startDate, dateRange.endDate]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' đ';
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    // Get movie name by ID
    const getMovieName = (movieId?: string) => {
        if (!movieId) return 'Không xác định';
        const movie = movies.find((m) => m._id === movieId);
        return movie ? movie.title : movieId;
    };

    // Handle quick date range selection
    const handleQuickDateRange = (range: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
        const today = new Date();

        switch (range) {
            case 'today':
                setDateRange({
                    startDate: format(today, 'yyyy-MM-dd'),
                    endDate: format(today, 'yyyy-MM-dd'),
                });
                break;
            case 'week':
                setDateRange({
                    startDate: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                    endDate: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                });
                break;
            case 'month':
                setDateRange({
                    startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
                    endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
                });
                break;
            case 'quarter':
                // Get start of 3 months ago
                setDateRange({
                    startDate: format(subMonths(today, 3), 'yyyy-MM-dd'),
                    endDate: format(today, 'yyyy-MM-dd'),
                });
                break;
            case 'year':
                // Get start of current year
                setDateRange({
                    startDate: format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'),
                    endDate: format(today, 'yyyy-MM-dd'),
                });
                break;
        }
    };

    // Handle custom date range change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange({
            ...dateRange,
            [name]: value,
        });
    };

    // Handle report type change
    const handleReportTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReportType(e.target.value as 'daily' | 'movie' | 'cinema');
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
                <p className="text-gray-600">Xem báo cáo doanh thu và thống kê đặt vé</p>
            </div>

            {/* Report Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Range Selection */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Khoảng thời gian</h3>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleQuickDateRange('today')}
                                    className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium"
                                >
                                    Hôm nay
                                </button>
                                <button
                                    onClick={() => handleQuickDateRange('week')}
                                    className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium"
                                >
                                    Tuần này
                                </button>
                                <button
                                    onClick={() => handleQuickDateRange('month')}
                                    className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium"
                                >
                                    Tháng này
                                </button>
                                <button
                                    onClick={() => handleQuickDateRange('quarter')}
                                    className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium"
                                >
                                    3 tháng gần đây
                                </button>
                                <button
                                    onClick={() => handleQuickDateRange('year')}
                                    className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium"
                                >
                                    Năm nay
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Từ ngày
                                    </label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={dateRange.startDate}
                                        onChange={handleDateChange}
                                        max={dateRange.endDate}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Đến ngày
                                    </label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={dateRange.endDate}
                                        onChange={handleDateChange}
                                        min={dateRange.startDate}
                                        max={format(new Date(), 'yyyy-MM-dd')}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report Type Selection */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Loại báo cáo</h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input
                                    id="report-daily"
                                    name="reportType"
                                    type="radio"
                                    value="daily"
                                    checked={reportType === 'daily'}
                                    onChange={handleReportTypeChange}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                />
                                <label htmlFor="report-daily" className="ml-2 block text-sm text-gray-700">
                                    Báo cáo doanh thu theo ngày
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="report-movie"
                                    name="reportType"
                                    type="radio"
                                    value="movie"
                                    checked={reportType === 'movie'}
                                    onChange={handleReportTypeChange}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                />
                                <label htmlFor="report-movie" className="ml-2 block text-sm text-gray-700">
                                    Báo cáo doanh thu theo phim
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="report-cinema"
                                    name="reportType"
                                    type="radio"
                                    value="cinema"
                                    checked={reportType === 'cinema'}
                                    onChange={handleReportTypeChange}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                />
                                <label htmlFor="report-cinema" className="ml-2 block text-sm text-gray-700">
                                    Báo cáo doanh thu theo rạp
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Tổng quan</h3>

                {loading ? (
                    <div className="py-8 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="py-8 text-center text-red-500">{error}</div>
                ) : !reportData ? (
                    <div className="py-8 text-center text-gray-500">
                        Không có dữ liệu cho khoảng thời gian đã chọn
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="text-lg font-medium text-blue-700 mb-2">Tổng doanh thu</h4>
                            <p className="text-3xl font-bold text-blue-900">{formatCurrency(reportData.totalRevenue)}</p>
                            <p className="text-sm text-blue-600 mt-1">
                                Từ {formatDate(dateRange.startDate)} đến {formatDate(dateRange.endDate)}
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="text-lg font-medium text-green-700 mb-2">Tổng số vé bán được</h4>
                            <p className="text-3xl font-bold text-green-900">{reportData.ticketsSold}</p>
                            <p className="text-sm text-green-600 mt-1">
                                Từ {formatDate(dateRange.startDate)} đến {formatDate(dateRange.endDate)}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <h4 className="text-lg font-medium text-purple-700 mb-2">Giá vé trung bình</h4>
                            <p className="text-3xl font-bold text-purple-900">{formatCurrency(reportData.averageTicketPrice)}</p>
                            <p className="text-sm text-purple-600 mt-1">
                                Từ {formatDate(dateRange.startDate)} đến {formatDate(dateRange.endDate)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed Report Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold">Chi tiết báo cáo</h3>
                </div>

                {loading ? (
                    <div className="py-8 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="py-8 text-center text-red-500">{error}</div>
                ) : !reportData || !reportData.data || reportData.data.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                        Không có dữ liệu chi tiết cho khoảng thời gian đã chọn
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                {reportType === 'daily' && (
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Ngày
                                    </th>
                                )}
                                {reportType === 'movie' && (
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Phim
                                    </th>
                                )}
                                {reportType === 'cinema' && (
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Rạp
                                    </th>
                                )}
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
                                {reportType !== 'daily' && (
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Tỷ lệ
                                    </th>
                                )}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.data.map((item, index) => (
                                <tr key={index}>
                                    {reportType === 'daily' && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.date ? formatDate(item.date) : ''}
                                            </div>
                                        </td>
                                    )}
                                    {reportType === 'movie' && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {getMovieName(item.movieId)}
                                            </div>
                                        </td>
                                    )}
                                    {reportType === 'cinema' && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.cinemaId || 'Không xác định'}
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{item.count}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatCurrency(item.revenue)}</div>
                                    </td>
                                    {reportType !== 'daily' && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {((item.revenue / reportData.totalRevenue) * 100).toFixed(1)}%
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Chart Visualization (Placeholder) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4">Biểu đồ trực quan</h3>
                <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center h-80">
                    <p className="text-gray-500">
                        Biểu đồ sẽ được hiển thị ở đây. Trong triển khai thực tế, sử dụng thư viện biểu đồ như Recharts.
                    </p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Ghi chú: Biểu đồ này hiển thị xu hướng doanh thu theo thời gian.
                </p>
            </div>
        </div>
    );
};

export default Reports;