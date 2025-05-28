// src/pages/customer/Checkout.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bookingService, type CreateBookingData } from '../../services/bookingService';
import { showtimeService } from '../../services/showtimeService';
import { useAuth } from '../../context/AuthContext';
import type { ShowtimeResponse} from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';

interface BookingData {
    showtimeId: string;
    seats: string[];
    promoCode?: string;
    promotionId?: string;
    subtotal: number;
    discount: number;
    total: number;
}

interface ErrorState
{
    showtime: string | null,
    booking: string | null,
}

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [showtime, setShowtime] = useState<ShowtimeResponse | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
    const [loading, setLoading] = useState({
        showtime: true,
        booking: false,
    });
    const [error, setError] = useState<ErrorState>({
        showtime: null,
        booking: null,
    });

    // Load booking data from session storage
    useEffect(() => {
        const storedData = sessionStorage.getItem('bookingData');
        if (!storedData) {
            toast.error('Không tìm thấy thông tin đặt vé. Vui lòng chọn ghế lại.');
            navigate('/movies');
            return;
        }

        try {
            const parsedData = JSON.parse(storedData);
            console.log('Booking data:', parsedData);
            setBookingData(parsedData);

            // Fetch showtime details
            const fetchShowtime = async () => {
                try {
                    const response = await showtimeService.getShowtimeById(parsedData.showtimeId);
                    console.log('Showtime response:', response);
                    setShowtime(response.data ?? null);
                    setLoading((prev) => ({ ...prev, showtime: false }));
                } catch (err) {
                    console.error('Error fetching showtime:', err);
                    setError((prev) => ({ ...prev, showtime: 'Không thể tải thông tin suất chiếu' }));
                    setLoading((prev) => ({ ...prev, showtime: false }));
                }
            };

            fetchShowtime();
        } catch (err) {
            console.error('Error parsing booking data:', err);
            toast.error('Dữ liệu đặt vé không hợp lệ. Vui lòng chọn ghế lại.');
            navigate('/movies');
        }
    }, [navigate]);

    // Format date and time
    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return format(date, 'EEEE, dd/MM/yyyy - HH:mm', { locale: vi });
    };

    // Handle payment method selection
    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!bookingData || !paymentMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán');
            return;
        }

        if (!acceptTerms) {
            toast.error('Vui lòng đồng ý với điều khoản và điều kiện');
            return;
        }

        setLoading((prev) => ({ ...prev, booking: true }));
        setError((prev) => ({ ...prev, booking: null }));

        try {
            const bookingRequestData: CreateBookingData = {
                showtimeId: bookingData.showtimeId,
                seats: bookingData.seats,
                promotionCode: bookingData.promoCode,
                paymentMethod,
            };

            console.log('Booking request data:', bookingRequestData);

            const response = await bookingService.createBooking(bookingRequestData);
            console.log('Booking response:', response);

            // Clear booking data from session storage
            sessionStorage.removeItem('bookingData');

            // Redirect to booking confirmation page
            navigate(`/booking-confirmation/${response.data?._id}`);

            toast.success('Đặt vé thành công!');
        } catch (err: any) {
            console.error('Booking error:', err);
            const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi đặt vé';
            setError((prev) => ({ ...prev, booking: errorMessage }));
            toast.error(errorMessage);
        } finally {
            setLoading((prev) => ({ ...prev, booking: false }));
        }
    };

    // Go back to seat selection
    const handleGoBackToSeatSelection = () => {
        navigate(`/showtimes/${bookingData?.showtimeId}/seats`);
    };

    if (!user) {
        navigate('/login', { state: { from: window.location.pathname } });
        return null;
    }

    if (loading.showtime) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error.showtime || !bookingData || !showtime) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    {error.showtime || 'Không tìm thấy thông tin đặt vé'}
                </h2>
                <p className="mb-8">
                    {error.showtime
                        ? 'Không thể tải thông tin suất chiếu.'
                        : 'Thông tin đặt vé không hợp lệ hoặc đã hết hạn.'
                    }
                </p>
                <Link to="/movies">
                    <Button variant="primary">Quay lại danh sách phim</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Header */}
            <div className="bg-secondary text-white py-4">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl font-bold">Thanh toán</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="md:flex md:gap-8">
                    {/* Left Column - Order Summary */}
                    <div className="md:w-1/3 mb-8 md:mb-0">
                        <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-4">Thông tin đặt vé</h2>

                            {/* Movie Information */}
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <div className="flex items-start">
                                    <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden mr-4">
                                        <img
                                            src={showtime.movieId?.posterUrl}
                                            alt={showtime.movieId?.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{showtime.movieId?.title}</h3>
                                        <p className="text-gray-600 text-sm">
                                            {showtime.cinemaId?.name} • {showtime.format}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            {formatDateTime(showtime.startTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Information */}
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <div className="flex justify-between mb-2">
                                    <span>Số lượng ghế</span>
                                    <span>{bookingData.seats.length}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Ghế đã chọn</span>
                                    <span>{bookingData.seats.join(', ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Giá vé</span>
                                    <span>{showtime.price.regular.toLocaleString('vi-VN')} đ</span>
                                </div>
                            </div>

                            {/* Promotion Information */}
                            {bookingData.promoCode && bookingData.discount > 0 && (
                                <div className="mb-4 pb-4 border-b border-gray-200">
                                    <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-md text-sm">
                                        <div className="font-semibold">Mã khuyến mãi: {bookingData.promoCode}</div>
                                        <div>Giảm giá: {bookingData.discount.toLocaleString('vi-VN')} đ</div>
                                    </div>
                                </div>
                            )}

                            {/* Pricing Summary */}
                            <div className="mb-4">
                                <div className="flex justify-between mb-2">
                                    <span>Tạm tính:</span>
                                    <span>{bookingData.subtotal.toLocaleString('vi-VN')} đ</span>
                                </div>

                                {bookingData.discount > 0 && (
                                    <div className="flex justify-between mb-2 text-green-600">
                                        <span>Giảm giá:</span>
                                        <span>-{bookingData.discount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                                    <span>Tổng cộng:</span>
                                    <span>{bookingData.total.toLocaleString('vi-VN')} đ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Payment Form */}
                    <div className="md:w-2/3">
                        <h2 className="text-2xl font-bold mb-6">Phương thức thanh toán</h2>

                        <form onSubmit={handleSubmit}>
                            {/* Payment Methods */}
                            <div className="bg-white border border-gray-200 rounded-lg mb-6">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="font-semibold">Chọn phương thức thanh toán</h3>
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* Credit/Debit Card */}
                                    <div className="border border-gray-200 rounded-md p-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="Credit Card"
                                                checked={paymentMethod === 'Credit Card'}
                                                onChange={() => handlePaymentMethodChange('Credit Card')}
                                                className="h-5 w-5 text-primary"
                                            />
                                            <div className="ml-3">
                                                <span className="font-medium">Thẻ tín dụng/ghi nợ</span>
                                                <div className="flex mt-1 space-x-2">
                                                    <div className="w-10 h-6 bg-gray-100 flex items-center justify-center rounded">
                                                        <span className="text-xs font-semibold">VISA</span>
                                                    </div>
                                                    <div className="w-10 h-6 bg-gray-100 flex items-center justify-center rounded">
                                                        <span className="text-xs font-semibold">MC</span>
                                                    </div>
                                                    <div className="w-10 h-6 bg-gray-100 flex items-center justify-center rounded">
                                                        <span className="text-xs font-semibold">JCB</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>

                                        {paymentMethod === 'Credit Card' && (
                                            <div className="mt-4 ml-8 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Số thẻ
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="1234 5678 9012 3456"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Tên chủ thẻ
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="NGUYEN VAN A"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Ngày hết hạn
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="MM/YY"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Mã bảo mật
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="123"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile Payment */}
                                    <div className="border border-gray-200 rounded-md p-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="MoMo"
                                                checked={paymentMethod === 'MoMo'}
                                                onChange={() => handlePaymentMethodChange('MoMo')}
                                                className="h-5 w-5 text-primary"
                                            />
                                            <div className="ml-3">
                                                <span className="font-medium">Ví MoMo</span>
                                                <div className="flex mt-1">
                                                    <div className="w-10 h-6 bg-pink-100 flex items-center justify-center rounded">
                                                        <span className="text-xs font-semibold text-pink-600">MoMo</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>

                                        {paymentMethod === 'MoMo' && (
                                            <div className="mt-4 ml-8">
                                                <p className="text-gray-600 text-sm">
                                                    Bạn sẽ được chuyển đến trang thanh toán MoMo sau khi xác nhận đặt vé.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Online Banking */}
                                    <div className="border border-gray-200 rounded-md p-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="Banking"
                                                checked={paymentMethod === 'Banking'}
                                                onChange={() => handlePaymentMethodChange('Banking')}
                                                className="h-5 w-5 text-primary"
                                            />
                                            <div className="ml-3">
                                                <span className="font-medium">Internet Banking</span>
                                                <div className="flex mt-1 space-x-2">
                                                    <div className="w-10 h-6 bg-gray-100 flex items-center justify-center rounded">
                                                        <span className="text-xs font-semibold">VCB</span>
                                                    </div>
                                                    <div className="w-10 h-6 bg-gray-100 flex items-center justify-center rounded">
                                                        <span className="text-xs font-semibold">TCB</span>
                                                    </div>
                                                    <div className="w-10 h-6 bg-gray-100 flex items-center justify-center rounded">
                                                        <span className="text-xs font-semibold">VTB</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>

                                        {paymentMethod === 'Banking' && (
                                            <div className="mt-4 ml-8">
                                                <p className="text-gray-600 text-sm">
                                                    Bạn sẽ được chuyển đến trang thanh toán của ngân hàng sau khi xác nhận đặt vé.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cash Payment */}
                                    <div className="border border-gray-200 rounded-md p-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="Cash"
                                                checked={paymentMethod === 'Cash'}
                                                onChange={() => handlePaymentMethodChange('Cash')}
                                                className="h-5 w-5 text-primary"
                                            />
                                            <div className="ml-3">
                                                <span className="font-medium">Thanh toán tại quầy</span>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    Thanh toán bằng tiền mặt tại quầy vé của rạp
                                                </p>
                                            </div>
                                        </label>

                                        {paymentMethod === 'Cash' && (
                                            <div className="mt-4 ml-8">
                                                <p className="text-gray-600 text-sm">
                                                    Vui lòng đến quầy vé trước giờ chiếu 30 phút để thanh toán và nhận vé.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Terms & Conditions */}
                            <div className="mb-6">
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={() => setAcceptTerms(!acceptTerms)}
                                        className="h-5 w-5 mt-0.5 text-primary"
                                    />
                                    <span className="ml-3 text-sm text-gray-600">
                                        Tôi đồng ý với <a href="#" className="text-primary hover:underline">Điều khoản sử dụng</a> và <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a> của CinemaHub.
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="flex flex-col sm:flex-row justify-between items-center">
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={handleGoBackToSeatSelection}
                                    className="mb-4 sm:mb-0"
                                >
                                    Quay lại chọn ghế
                                </Button>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    type="submit"
                                    disabled={!paymentMethod || !acceptTerms || loading.booking}
                                    isLoading={loading.booking}
                                >
                                    Xác nhận thanh toán
                                </Button>
                            </div>

                            {error.booking && (
                                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
                                    {error.booking}
                                </div>
                            )}

                            <p className="text-sm text-gray-500 mt-6 text-center">
                                Lưu ý: Đối với các hình thức chuyển khoản, vé sẽ được gửi sau khi xác nhận thanh toán thành công.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;