// src/pages/customer/BookingDetail.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { bookingService } from '../../services/bookingService';
import { reviewService, type CreateReviewData } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import type { Booking } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';

const BookingDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewContent, setReviewContent] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);

    // Check if booking is from the past
    const isPastBooking = booking?.showtime
        ? new Date(booking.showtime.startTime) < new Date()
        : false;

    // Fetch booking details
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }

        const fetchBooking = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const response = await bookingService.getBookingById(id);
                console.log(response);
                setBooking(response.data ?? null);
                setError(null);
            } catch {
                setError('Không thể tải thông tin đặt vé');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id, user, navigate]);

    // Generate QR Code data
    const generateQRData = (booking: Booking) => {
        const qrData = {
            bookingId: booking._id,
            bookingCode: booking.bookingCode || `BK-${booking._id.slice(-8).toUpperCase()}`,
            movieTitle: booking.movieId?.title || 'Unknown Movie',
            cinemaName: booking.cinemaId?.name || 'Unknown Cinema',
            showtime: booking.showtimeId?.startTime || '',
            seats: booking.seats,
            totalAmount: booking.finalAmount,
            verificationUrl: `${window.location.origin}/verify-booking/${booking._id}`
        };
        return JSON.stringify(qrData);
    };

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

    // Handle review submission
    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!booking || !booking.movie) {
            toast.error('Không thể gửi đánh giá vì thiếu thông tin phim');
            return;
        }

        if (reviewRating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        if (reviewContent.trim() === '') {
            toast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }

        setReviewLoading(true);

        try {
            const reviewData: CreateReviewData = {
                movieId: booking.movieId,
                bookingId: booking._id,
                rating: reviewRating,
                title: reviewTitle.trim(),
                content: reviewContent.trim()
            };

            await reviewService.createReview(reviewData);
            toast.success('Đánh giá của bạn đã được gửi và đang chờ phê duyệt!');
            setHasReviewed(true);
            setShowReviewForm(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    {error || 'Không tìm thấy thông tin đặt vé'}
                </h2>
                <p className="mb-8">Không thể tải thông tin đặt vé. Vui lòng thử lại sau.</p>
                <Link to="/bookings">
                    <Button variant="primary">Quay lại lịch sử đặt vé</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Chi tiết đặt vé</h1>
                        <Link to="/bookings">
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
                                        <path
                                            fillRule="evenodd"
                                            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                }
                            >
                                Quay lại danh sách
                            </Button>
                        </Link>
                    </div>

                    {/* Booking Card */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                        {/* Booking Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="mb-2 md:mb-0">
                                    <span className="text-gray-600">Mã đặt vé:</span>
                                    <span className="ml-2 font-bold text-lg">
                                        {booking.bookingCode || `BK-${booking._id.slice(-8).toUpperCase()}`}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-gray-600 mr-2">Trạng thái:</span>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                                            booking.status
                                        )}`}
                                    >
                                        {getStatusText(booking.status)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Booking Content */}
                        <div className="p-6">
                            {/* Movie and Showtime Info */}
                            <div className="flex flex-col md:flex-row md:items-start mb-8">
                                {booking.movie && (
                                    <div className="w-full md:w-1/3 mb-4 md:mb-0">
                                        <div className="w-full h-auto aspect-[2/3] rounded-lg overflow-hidden">
                                            <img
                                                src={booking.movieId.posterUrl}
                                                alt={booking.movieId.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="md:ml-6 flex-grow">
                                    <h2 className="text-2xl font-bold mb-4">
                                        {booking.movieId ? (
                                            <Link to={`/movies/${booking.movieId._id}`} className="hover:text-primary transition-colors">
                                                {booking.movieId.title}
                                            </Link>
                                        ) : (
                                            'Phim không xác định'
                                        )}
                                    </h2>

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3">
                                            <div>
                                                <span className="font-medium text-gray-700">Rạp:</span>
                                                <p>{booking.cinemaId?.name || 'Không xác định'}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Phòng chiếu:</span>
                                                <p>{booking.hallId}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Suất chiếu:</span>
                                                <p>
                                                    {booking.showtimeId
                                                        ? formatDateTime(booking.showtimeId.startTime)
                                                        : 'Không xác định'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Định dạng:</span>
                                                <p>{booking.showtimeId?.format || 'Không xác định'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="font-medium text-gray-700">Ghế:</span>
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {booking.seats.map((seat) => (
                                                    <span
                                                        key={seat}
                                                        className="inline-block px-2 py-1 bg-gray-100 rounded-md text-sm"
                                                    >
                                                        {seat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold mb-4">Thông tin thanh toán</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Thời gian đặt vé:</span>
                                        <span>{formatDateTime(booking.bookingTime)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính:</span>
                                        <span>{booking.totalAmount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    {booking.discount && booking.discount.amount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Giảm giá:</span>
                                            <span>-{booking.discount.amount.toLocaleString('vi-VN')} đ</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2">
                                        <span>Tổng cộng:</span>
                                        <span>{booking.finalAmount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Phương thức thanh toán:</span>
                                        <span>{booking.paymentMethod}</span>
                                    </div>
                                    {booking.paymentId && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Mã giao dịch:</span>
                                            <span>{booking.paymentId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* QR Code for ticket */}
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold mb-4">Mã QR vé điện tử</h3>
                                <div className="bg-white p-4 mx-auto w-64 h-64 border border-gray-200 rounded-lg flex items-center justify-center">
                                    <QRCode
                                        size={200}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        value={generateQRData(booking)}
                                        viewBox={`0 0 200 200`}
                                        fgColor="#000000"
                                        bgColor="#ffffff"
                                    />
                                </div>
                                <p className="text-gray-500 text-sm mt-2">
                                    Quét mã QR tại quầy để nhận vé
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Mã vé: {booking.bookingCode || `BK-${booking._id.slice(-8).toUpperCase()}`}
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
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

                                {isPastBooking && booking.movieId && booking.status === 'confirmed' && !hasReviewed && (
                                    <Button
                                        variant={showReviewForm ? "outline" : "primary"}
                                        onClick={() => setShowReviewForm(!showReviewForm)}
                                        icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                                />
                                            </svg>
                                        }
                                    >
                                        {showReviewForm ? "Hủy đánh giá" : "Đánh giá phim"}
                                    </Button>
                                )}

                                {hasReviewed && (
                                    <Button
                                        variant="outline"
                                        disabled
                                    >
                                        Đã đánh giá
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Review Form */}
                    {showReviewForm && booking.movieId && (
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold">Đánh giá phim {booking.movieId.title}</h3>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmitReview}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Đánh giá của bạn <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="p-1 focus:outline-none"
                                                >
                                                    <svg
                                                        className={`w-8 h-8 ${
                                                            reviewRating >= star ? 'text-yellow-400' : 'text-gray-300'
                                                        }`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                    </svg>
                                                </button>
                                            ))}
                                            <span className="ml-2 text-gray-600 self-center">
                                                {reviewRating > 0 ? `${reviewRating}/5` : 'Chọn số sao'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="reviewTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                            Tiêu đề
                                        </label>
                                        <input
                                            type="text"
                                            id="reviewTitle"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                            placeholder="Tiêu đề đánh giá (không bắt buộc)"
                                            value={reviewTitle}
                                            onChange={(e) => setReviewTitle(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="reviewContent" className="block text-sm font-medium text-gray-700 mb-1">
                                            Nội dung <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="reviewContent"
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                            placeholder="Hãy chia sẻ cảm nhận của bạn về bộ phim..."
                                            value={reviewContent}
                                            onChange={(e) => setReviewContent(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            isLoading={reviewLoading}
                                            disabled={reviewRating === 0 || reviewContent.trim() === '' || reviewLoading}
                                        >
                                            Gửi đánh giá
                                        </Button>
                                    </div>

                                    <p className="mt-4 text-sm text-gray-500">
                                        Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển thị công khai.
                                    </p>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Note for future showings */}
                    {!isPastBooking && booking.showtime && (
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">Lưu ý</h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>
                                            Vui lòng đến rạp trước giờ chiếu ít nhất 15 phút để nhận vé. Đơn đặt vé này sẽ hết hiệu lực sau khi suất chiếu bắt đầu.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetail;