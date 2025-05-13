// src/pages/admin/Reports.tsx
import React, { useState, useEffect } from 'react';
import { bookingService, type BookingStats } from '../../services/bookingService';
import { movieService } from '../../services/movieService';
import { cinemaService } from '../../services/cinemaService';
import type { Movie, Cinema } from '../../types/models';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminReports: React.FC = () => {
    const { user } = useAuth();

    // State for date range
    const [dateRange, setDateRange] = useState({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
    });

    // State for report type
    const [reportType, setReportType] = useState<'daily' | 'movie' | 'cinema'>('daily');

    // State for filter options
    const [movieFilter, setMovieFilter] = useState<string>('all');
    const [cinemaFilter, setCinemaFilter] = useState<string>('all');

    // State for report data
    const [reportData, setReportData] = useState<BookingStats | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [cinemas, setCinemas] = useState<Cinema[]>([]);

    const [loading, setLoading] = useState({
        report: true,
        movies: true,
        cinemas: true
    });

    const [error, setError] = useState({
        report: null,
        movies: null,
        cinemas: null
    });

    // Load movie and cinema data for filtering and display
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const moviesResponse = await movieService.getAllMovies();
                setMovies(moviesResponse.data?.data || []);
                setLoading(prev => ({ ...prev, movies: false }));
            } catch (err) {
                setError(prev => ({ ...prev, movies: 'Không thể tải danh sách phim' }));
                setLoading(prev => ({ ...prev, movies: false }));
            }

            try {
                const cinemasResponse = await cinemaService.getAllCinemas();
                setCinemas(cinemasResponse.data?.data || []);
                setLoading(prev => ({ ...prev, cinemas: false }));
            } catch (err) {
                setError(prev => ({ ...prev, cinemas: 'Không thể tải danh sách rạp' }));
                setLoading(prev => ({ ...prev, cinemas: false }));
            }
        };

        fetchFilterData();
    }, []);

    // Generate report when parameters change
    useEffect(() => {
        const generateReport = async () => {
            setLoading(prev => ({ ...prev, report: true }));
            setError(prev => ({ ...prev, report: null }));

            try {
                let response;
                const queryParams: Record<string, string> = {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                };

                // Add filters if specific movie or cinema is selected
                if (reportType === 'movie' && movieFilter !== 'all') {
                    queryParams.movieId = movieFilter;
                }

                if (reportType === 'cinema' && cinemaFilter !== 'all') {
                    queryParams.cinemaId = cinemaFilter;
                }

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
                setError(prev => ({ ...prev, report: 'Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.' }));
            } finally {
                setLoading(prev => ({ ...prev, report: false }));
            }
        };

        generateReport();
    }, [reportType, dateRange.startDate, dateRange.endDate, movieFilter, cinemaFilter]);

    // Get movie name by ID
    const getMovieName = (movieId?: string) => {
        if (!movieId) return 'Không xác định';
        const movie = movies.find((m) => m._id === movieId);
        return movie ? movie.title : movieId;
    };

    // Get cinema name by ID
    const getCinemaName = (cinemaId?: string) => {
        if (!cinemaId) return 'Không xác định';
        const cinema = cinemas.find((c) => c._id === cinemaId);
        return cinema ? cinema.name : cinemaId;
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' đ';
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    // Format date for display with day of week
    const formatDateWithDay = (dateString: string) => {
        return format(new Date(dateString), 'EEEE, dd/MM/yyyy', { locale: vi });
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

    // Export report to CSV
    const exportToCSV = () => {
        if (!reportData || !reportData.data || reportData.data.length === 0) {
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";

        // Add headers
        switch (reportType) {
            case 'daily':
                csvContent += "Ngày,Số vé,Doanh thu\n";
                break;
            case 'movie':
                csvContent += "Phim,Số vé,Doanh thu\n";
                break;
            case 'cinema':
                csvContent += "Rạp,Số vé,Doanh thu\n";
                break;
        }

        // Add data rows
        reportData.data.forEach(item => {
            let row = "";
            switch (reportType) {
                case 'daily':
                    row = `${item.date ? formatDate(item.date) : ''},${item.count},${item.revenue}\n`;
                    break;
                case 'movie':
                    row = `${getMovieName(item.movieId)},${item.count},${item.revenue}\n`;
                    break;
                case 'cinema':
                    row = `${getCinemaName(item.cinemaId)},${item.count},${item.revenue}\n`;
                    break;
            }
            csvContent += row;
        });

        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `report-${reportType}-${dateRange.startDate}-to-${dateRange.endDate}.csv`);
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
    };

    // Check for admin access
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Thống kê hệ thống</h1>
                    <p className="text-gray-600">Xem và phân tích dữ liệu hoạt động kinh doanh</p>
                </div>

                <Button
                    variant="outline"
                    onClick={exportToCSV}
                    disabled={!reportData || !reportData.data || reportData.data.length === 0}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    }
                >
                    Xuất báo cáo (CSV)
                </Button>
            </div>

            {/* Controls Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                    {/* Report Type & Filters */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Loại báo cáo & Bộ lọc</h3>
                        <div className="space-y-4">
                            {/* Report Type Radio Buttons */}
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

                            {/* Additional Filters */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                {reportType === 'movie' && (
                                    <div>
                                        <label htmlFor="movieFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                            Lọc theo phim
                                        </label>
                                        <select
                                            id="movieFilter"
                                            value={movieFilter}
                                            onChange={(e) => setMovieFilter(e.target.value)}
                                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="all">Tất cả phim</option>
                                            {movies.map(movie => (
                                                <option key={movie._id} value={movie._id}>{movie.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {reportType === 'cinema' && (
                                    <div>
                                        <label htmlFor="cinemaFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                            Lọc theo rạp
                                        </label>
                                        <select
                                            id="cinemaFilter"
                                            value={cinemaFilter}
                                            onChange={(e) => setCinemaFilter(e.target.value)}
                                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="all">Tất cả rạp</option>
                                            {cinemas.map(cinema => (
                                                <option key={cinema._id} value={cinema._id}>{cinema.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Tổng quan</h3>

                {loading.report ? (
                    <div className="py-8 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : error.report ? (
                    <div className="py-8 text-center text-red-500">{error.report}</div>
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

                {loading.report ? (
                    <div className="py-8 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : error.report ? (
                    <div className="py-8 text-center text-red-500">{error.report}</div>
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
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Tỷ lệ
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.data.sort((a, b) => {
                                // Sort by revenue (descending) for movie and cinema reports
                                if (reportType !== 'daily') {
                                    return b.revenue - a.revenue;
                                }
                                // Sort by date (ascending) for daily reports
                                if (a.date && b.date) {
                                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                                }
                                return 0;
                            }).map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    {reportType === 'daily' && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.date ? formatDateWithDay(item.date) : ''}
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
                                                {getCinemaName(item.cinemaId)}
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{item.count}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatCurrency(item.revenue)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm text-gray-900">
                                                {((item.revenue / reportData.totalRevenue) * 100).toFixed(1)}%
                                            </div>
                                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-primary h-2.5 rounded-full"
                                                    style={{ width: `${((item.revenue / reportData.totalRevenue) * 100).toFixed(1)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Visualization Section */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-4">Biểu đồ phân tích</h3>
                <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center h-80">
                    <p className="text-gray-500">
                        Biểu đồ sẽ được hiển thị ở đây. Trong triển khai thực tế, sử dụng thư viện biểu đồ như Recharts.
                    </p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Ghi chú: Biểu đồ này hiển thị xu hướng doanh thu theo thời gian. Trong triển khai thực tế,
                    sẽ tích hợp biểu đồ từ thư viện recharts để hiển thị dữ liệu doanh thu, số vé và giá vé trung bình theo thời gian.
                </p>
            </div>
        </div>
    );
};

export default AdminReports;