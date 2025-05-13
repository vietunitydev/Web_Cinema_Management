// src/pages/customer/BookingHistory.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import type { Booking } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const BookingHistory: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');

    const itemsPerPage = 5;

    // Fetch user bookings
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }

        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await bookingService.getUserBookings(currentPage, itemsPerPage);
                setBookings(response.data?.data || []);
                setTotalItems(response.data?.totalCount || 0);
                setTotalPages(response.data?.totalPages || 1);
                setError(null);
            } catch (err) {
                setError('Không thể tải lịch sử đặt vé');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user, currentPage, navigate]);

    // Format date and time
    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return format(date, 'EEEE, dd/MM/yyyy - HH:mm', { locale: vi });
    };

    // Get status badge color
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'canceled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'Đã xác nhận';
            case 'pending':
                return 'Đang xử lý';
            case 'canceled':
                return 'Đã hủy';
            default:
                return 'Không xác định';
        }
    };

    // Filter bookings based on active tab
    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'all') return true;

        const showtimeDate = new Date(booking.showtime?.startTime || '');
        const now = new Date();

        if (activeTab === 'upcoming') {
            return showtimeDate > now;
        } else if (activeTab === 'past') {
            return showtimeDate <= now;
        }

        return true;
    });

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Lịch sử đặt vé</h1>

                    {/* Filter Tabs */}
                    <div className="bg-white shadow-sm rounded-lg mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="flex">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                                        activeTab === 'all'
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Tất cả
                                </button>
                                <button
                                    onClick={() => setActiveTab('upcoming')}
                                    className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                                        activeTab === 'upcoming'
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Sắp tới
                                </button>
                                <button
                                    onClick={() => setActiveTab('past')}
                                    className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                                        activeTab === 'past'
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Đã qua
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Bookings List */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Không có đơn đặt vé nào</h3>
                            <p className="mt-1 text-gray-500">
                                {activeTab === 'all'
                                    ? 'Bạn chưa đặt vé nào. Hãy đặt vé để xem phim yêu thích của bạn!'
                                    : activeTab === 'upcoming'
                                        ? 'Bạn không có đơn đặt vé nào cho lịch chiếu sắp tới.'
                                        : 'Bạn không có lịch sử đặt vé nào.'}
                            </p>
                            <div className="mt-6">
                                <Link to="/movies">
                                    <Button variant="primary">Đặt vé ngay</Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredBookings.map((booking) => (
                                <div key={booking._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    {/* Booking Header */}
                                    <div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <div>
                                            <span className="text-sm text-gray-600">Mã đặt vé:</span>
                                            <span className="ml-2 font-medium">
                        {booking.bookingCode || `BK-${booking._id.slice(-8).toUpperCase()}`}
                      </span>
                                        </div>
                                        <div>
                      <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              booking.status
                          )}`}
                      >
                        {getStatusText(booking.status)}
                      </span>
                                        </div>
                                    </div>

                                    {/* Booking Content */}
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Movie Poster */}
                                            {booking.movie && (
                                                <div className="w-full md:w-1/4 flex-shrink-0 mb-4 md:mb-0">
                                                    <div className="w-full h-48 md:h-auto md:aspect-[2/3] rounded-lg overflow-hidden">
                                                        <img
                                                            src={booking.movie.posterUrl}
                                                            alt={booking.movie.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Booking Details */}
                                            <div className="md:ml-6 flex-grow">
                                                <h3 className="text-xl font-bold mb-2">
                                                    {booking.movie ? (
                                                        <Link
                                                            to={`/movies/${booking.movie._id}`}
                                                            className="hover:text-primary transition-colors"
                                                        >
                                                            {booking.movie.title}
                                                        </Link>
                                                    ) : (
                                                        'Phim không xác định'
                                                    )}
                                                </h3>

                                                <div className="space-y-2 mb-4">
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Rạp:</span>{' '}
                                                        {booking.cinema?.name || 'Không xác định'}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Suất chiếu:</span>{' '}
                                                        {booking.showtime
                                                            ? formatDateTime(booking.showtime.startTime)
                                                            : 'Không xác định'}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Ghế:</span>{' '}
                                                        {booking.seats.join(', ')}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Thời gian đặt:</span>{' '}
                                                        {formatDateTime(booking.bookingTime)}
                                                    </p>
                                                </div>

                                                <div className="border-t border-gray-200 pt-4 mb-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Tổng tiền:</span>
                                                        <span className="font-bold">{booking.finalAmount.toLocaleString('vi-VN')} đ</span>
                                                    </div>
                                                    {booking.discount && booking.discount.amount > 0 && (
                                                        <div className="flex justify-between text-sm text-green-600">
                                                            <span>Giảm giá:</span>
                                                            <span>-{booking.discount.amount.toLocaleString('vi-VN')} đ</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-sm text-gray-500">
                                                        <span>Phương thức thanh toán:</span>
                                                        <span>{booking.paymentMethod}</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <Link to={`/bookings/${booking._id}`}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            icon={
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-5 w-5"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            }
                                                        >
                                                            Xem chi tiết
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && filteredBookings.length > 0 && totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                            />
                        </div>
                    )}

                    {/* Back Button */}
                    <div className="mt-8 flex justify-between">
                        <Link to="/profile">
                            <Button
                                variant="outline"
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                }
                            >
                                Quay lại hồ sơ
                            </Button>
                        </Link>

                        <Link to="/">
                            <Button
                                variant="outline"
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                }
                                iconPosition="right"
                            >
                                Trang chủ
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingHistory;