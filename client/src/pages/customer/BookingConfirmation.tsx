// src/pages/customer/BookingConfirmation.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { type Booking } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const BookingConfirmation: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!id) return;

            try {
                const response = await bookingService.getBookingById(id);
                setBooking(response.data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải thông tin đặt vé');
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    // Format date and time
    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return format(date, 'EEEE, dd/MM/yyyy - HH:mm', { locale: vi });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !booking || !booking.movie || !booking.cinema || !booking.showtime) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    {error || 'Không tìm thấy thông tin đặt vé'}
                </h2>
                <p className="mb-8">Không thể tải thông tin đặt vé. Vui lòng thử lại sau.</p>
                <Link to="/movies">
                    <Button variant="primary">Quay lại danh sách phim</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-green-500 text-white p-6 text-center">
                        <svg
                            className="w-16 h-16 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h2 className="text-3xl font-bold mt-2">Đặt vé thành công!</h2>
                        <p className="text-xl mt-1">Cảm ơn bạn đã đặt vé tại CinemaHub</p>
                    </div>

                    {/* Booking Information */}
                    <div className="p-6">
                        <div className="border-b border-gray-200 pb-6 mb-6">
                            <h3 className="text-xl font-bold mb-4">Thông tin đặt vé</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600">Mã đặt vé</p>
                                    <p className="font-semibold">{booking.bookingCode || `BK-${booking._id.slice(-8).toUpperCase()}`}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Ngày đặt vé</p>
                                    <p className="font-semibold">{formatDateTime(booking.bookingTime)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Tình trạng</p>
                                    <p className="font-semibold">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Đang xử lý'}
                    </span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Phương thức thanh toán</p>
                                    <p className="font-semibold">{booking.paymentMethod}</p>
                                </div>
                            </div>
                        </div>

                        {/* Movie Information */}
                        <div className="border-b border-gray-200 pb-6 mb-6">
                            <h3 className="text-xl font-bold mb-4">Thông tin phim</h3>
                            <div className="flex">
                                <div className="w-24 h-36 flex-shrink-0 rounded overflow-hidden mr-4">
                                    <img
                                        src={booking.movie.posterUrl}
                                        alt={booking.movie.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{booking.movie.title}</h4>
                                    <p className="text-gray-600 mb-2">
                                        {booking.movie.duration} phút • {booking.movie.genre.join(', ')} • {booking.movie.ageRestriction}
                                    </p>
                                    <p className="mb-2">
                                        <span className="text-gray-600">Rạp:</span>{' '}
                                        <span className="font-medium">{booking.cinema.name}</span>
                                    </p>
                                    <p className="mb-2">
                                        <span className="text-gray-600">Suất chiếu:</span>{' '}
                                        <span className="font-medium">{formatDateTime(booking.showtime.startTime)}</span>
                                    </p>
                                    <p className="mb-2">
                                        <span className="text-gray-600">Định dạng:</span>{' '}
                                        <span className="font-medium">{booking.showtime.format}</span>
                                        {booking.showtime.language && (
                                            <span> • {booking.showtime.language}</span>
                                        )}
                                    </p>
                                    <p>
                                        <span className="text-gray-600">Ghế:</span>{' '}
                                        <span className="font-medium">{booking.seats.join(', ')}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="border-b border-gray-200 pb-6 mb-6 text-center">
                            <h3 className="text-xl font-bold mb-4">Mã QR vé điện tử</h3>
                            <div className="bg-white p-4 mx-auto w-52 h-52 border border-gray-200 rounded-lg flex items-center justify-center">
                                <div className="text-gray-400">
                                    {/* Placeholder for QR code */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-32 w-32"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-gray-600 mt-3 text-sm">
                                Quét mã QR tại quầy để nhận vé
                            </p>
                        </div>

                        {/* Payment Summary */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-4">Chi tiết thanh toán</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Giá vé x {booking.seats.length}</span>
                                    <span>{booking.totalAmount.toLocaleString('vi-VN')} đ</span>
                                </div>

                                {booking.discount && booking.discount.amount > 0 && (
                                    <div className="flex justify-between mb-2 text-green-600">
                                        <span>Giảm giá</span>
                                        <span>-{booking.discount.amount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
                                    <span>Tổng cộng</span>
                                    <span>{booking.finalAmount.toLocaleString('vi-VN')} đ</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                }
                            >
                                In vé
                            </Button>
                            <Link to="/bookings">
                                <Button variant="outline">Xem lịch sử đặt vé</Button>
                            </Link>
                            <Link to="/">
                                <Button variant="primary">Về trang chủ</Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto mt-8 text-center">
                    <p className="text-gray-600">
                        Email xác nhận đặt vé đã được gửi đến địa chỉ email của bạn. <br />
                        Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: <strong>1900 6017</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;