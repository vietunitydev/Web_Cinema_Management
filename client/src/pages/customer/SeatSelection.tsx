// src/pages/customer/SeatSelection.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { showtimeService } from '../../services/showtimeService';
import { promotionService } from '../../services/promotionService';
import type {ShowtimeResponse} from '../../types/models';
import type { PromotionCheckResult } from '../../services/promotionService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';

const SeatSelection: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Showtime ID
    const { user } = useAuth();
    const navigate = useNavigate();

    const [showtime, setShowtime] = useState<ShowtimeResponse | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState<number>(0);
    const [validPromo, setValidPromo] = useState<PromotionCheckResult | null>(null);
    const [loading, setLoading] = useState({
        showtime: true,
        checkingPromo: false,
        proceedingToCheckout: false,
    });
    const [error, setError] = useState({
        showtime: null,
        promo: null,
    });

    // Fetch showtime details
    useEffect(() => {
        const fetchShowtime = async () => {
            if (!id) return;

            try {
                const response = await showtimeService.getShowtimeById(id);
                console.log(response.data);
                setShowtime(response.data ?? null);
                setLoading((prev) => ({ ...prev, showtime: false }));
            } catch (err) {
                setError((prev) => ({ ...prev, showtime: 'Không thể tải thông tin suất chiếu' }));
                setLoading((prev) => ({ ...prev, showtime: false }));
            }
        };

        fetchShowtime();
    }, [id]);

    useEffect(() => {
        console.log('Showtime đã được cập nhật:', showtime);

        if (showtime) {
        }
    }, [showtime]);

    // Seat selection handler
    const handleSeatClick = (seatId: string) => {
        if (selectedSeats.includes(seatId)) {
            // Deselect the seat
            setSelectedSeats(selectedSeats.filter((seat) => seat !== seatId));
        } else {
            // Select the seat
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    // Check if a seat is available
    const isSeatAvailable = (seatId: string): boolean => {
        if (!showtime) return false;
        return (
            showtime.availableSeats.includes(seatId) &&
            !showtime.bookedSeats.includes(seatId)
        );
    };

    // Check if a seat is selected
    const isSeatSelected = (seatId: string): boolean => {
        return selectedSeats.includes(seatId);
    };

    // Handle promo code check
    const handlePromoCheck = async () => {
        if (!promoCode.trim()) {
            setError((prev) => ({ ...prev, promo: 'Vui lòng nhập mã khuyến mãi' }));
            return;
        }

        if (!showtime || !showtime.movieId || !showtime.cinemaId) {
            setError((prev) => ({ ...prev, promo: 'Không thể kiểm tra mã khuyến mãi lúc này' }));
            return;
        }

        setLoading((prev) => ({ ...prev, checkingPromo: true }));
        setError((prev) => ({ ...prev, promo: null }));
        setValidPromo(null);

        try {
            const totalAmount = calculateSubtotal();
            const response = await promotionService.checkCoupon({
                couponCode: promoCode,
                totalAmount,
                movieId: showtime.movieId._id,
                cinemaId: showtime.cinemaId._id,
            });

            console.log('Promotion check response:', response);

            if (response.data) {
                setValidPromo(response.data);
                setPromoDiscount(response.data.discountAmount || 0);
                toast.success('Áp dụng mã khuyến mãi thành công!');
            } else {
                setError((prev) => ({ ...prev, promo: 'Mã khuyến mãi không hợp lệ' }));
                setPromoDiscount(0);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi kiểm tra mã khuyến mãi';
            setError((prev) => ({ ...prev, promo: errorMessage }));
            setPromoDiscount(0);
            toast.error(errorMessage);
        } finally {
            setLoading((prev) => ({ ...prev, checkingPromo: false }));
        }
    };

    // Remove promo code
    const handleRemovePromo = () => {
        setPromoCode('');
        setValidPromo(null);
        setPromoDiscount(0);
        setError((prev) => ({ ...prev, promo: null }));
        toast.info('Đã xóa mã khuyến mãi');
    };

    // Format date and time
    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return format(date, 'EEEE, dd/MM/yyyy - HH:mm', { locale: vi });
    };

    // Calculate subtotal
    const calculateSubtotal = (): number => {
        if (!showtime) return 0;
        const ticketPrice = showtime.price.regular;
        return ticketPrice * selectedSeats.length;
    };

    // Calculate final total
    const calculateTotal = (): number => {
        const subtotal = calculateSubtotal();
        return subtotal - promoDiscount;
    };

    // Proceed to checkout
    const handleProceedToCheckout = () => {
        if (!user) {
            // Redirect to login if not logged in
            toast.info('Vui lòng đăng nhập để tiếp tục đặt vé');
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }

        if (selectedSeats.length === 0) {
            toast.error('Vui lòng chọn ít nhất một ghế');
            return;
        }

        // Store booking data in session storage
        const bookingData = {
            showtimeId: id,
            seats: selectedSeats,
            promoCode: validPromo ? promoCode : undefined,
            promotionId: validPromo?.data?._id,
            subtotal: calculateSubtotal(),
            discount: promoDiscount,
            total: calculateTotal(),
        };

        sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
        navigate('/checkout');
    };

    // Prepare the seating chart
    const renderSeatingChart = () => {
        if (!showtime || !showtime.cinemaId || !showtime.movieId) return null;

        const hall = showtime.cinemaId.halls.find(h => h.hallId === showtime.hallId);

        if (!hall) return <div className="text-center py-4">Không có thông tin về phòng chiếu</div>;

        const { rows, seatsPerRow } = hall.seatingArrangement;

        // Create seating layout
        const rowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i)); // A, B, C, ...

        return (
            <div className="mb-8">
                <div className="bg-gray-800 p-4 text-white text-center mb-8 rounded-t-lg">
                    <div className="text-lg font-semibold">Màn hình</div>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-max">
                        {rowLabels.map((rowLabel) => (
                            <div key={rowLabel} className="flex mb-2 items-center">
                                <div className="w-10 text-center font-bold">{rowLabel}</div>
                                <div className="flex space-x-2">
                                    {Array.from({ length: seatsPerRow }, (_, i) => i + 1).map((seatNumber) => {
                                        const seatId = `${rowLabel}${seatNumber}`;
                                        const available = isSeatAvailable(seatId);
                                        const selected = isSeatSelected(seatId);

                                        return (
                                            <button
                                                key={seatId}
                                                onClick={() => available && handleSeatClick(seatId)}
                                                disabled={!available}
                                                className={`w-10 h-10 flex items-center justify-center rounded-md focus:outline-none transition-colors ${
                                                    selected
                                                        ? 'bg-primary text-white'
                                                        : available
                                                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                {seatNumber}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="w-10 text-center font-bold">{rowLabel}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-6">
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-100 rounded-md mr-2"></div>
                        <span>Ghế trống</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-primary rounded-md mr-2"></div>
                        <span>Ghế đã chọn</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-300 rounded-md mr-2"></div>
                        <span>Ghế đã đặt</span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading.showtime) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error.showtime || !showtime) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    {error.showtime || 'Không tìm thấy suất chiếu'}
                </h2>
                <p className="mb-8">Không thể tải thông tin suất chiếu. Vui lòng thử lại sau.</p>
                <Link to="/movies">
                    <Button variant="primary">Quay lại danh sách phim</Button>
                </Link>
            </div>
        );
    }

    // Extra safety check for movie and cinema data
    if (!showtime.movieId || !showtime.cinemaId) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    Thông tin không đầy đủ
                </h2>
                <p className="mb-8">Không thể tải đầy đủ thông tin phim hoặc rạp chiếu.</p>
                <Link to="/movies">
                    <Button variant="primary">Quay lại danh sách phim</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Movie & Showtime Information */}
            <div className="bg-secondary text-white py-4">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center">
                        <div className="flex items-center mb-2 md:mb-0">
                            <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden mr-4">
                                <img
                                    src={showtime.movieId.posterUrl}
                                    alt={showtime.movieId.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">{showtime.movieId.title}</h1>
                                <div className="text-sm text-gray-300">
                                    <span>{formatDateTime(showtime.startTime)}</span>
                                    <span className="mx-2">•</span>
                                    <span>{showtime.format}</span>
                                    <span className="mx-2">•</span>
                                    <span>{showtime.movieId.title}</span>
                                </div>
                            </div>
                        </div>
                        <div className="md:ml-auto mt-2 md:mt-0">
                            <Link to={`/movies/${showtime.movieId._id}/showtimes`}>
                                <Button variant="outline" size="sm">
                                    Chọn suất khác
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="md:flex md:gap-8">
                    {/* Left Column - Seating Chart */}
                    <div className="md:w-2/3 mb-8 md:mb-0">
                        <h2 className="text-2xl font-bold mb-6">Chọn ghế</h2>

                        {/* Seating Chart */}
                        {renderSeatingChart()}

                        {/* Selected Seats Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Ghế đã chọn:</h3>
                            {selectedSeats.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedSeats.map((seat) => (
                                        <div
                                            key={seat}
                                            className="px-3 py-1 bg-primary text-white rounded-full text-sm"
                                        >
                                            {seat}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">Chưa chọn ghế nào</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Summary & Payment */}
                    <div className="md:w-1/3">
                        <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-4">Thông tin đặt vé</h2>

                            {/* Movie Information */}
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <h3 className="font-semibold">{showtime.cinemaId.name}</h3>
                                <p className="text-gray-600 text-sm">
                                    {showtime.cinemaId.name} • {showtime.format}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {formatDateTime(showtime.startTime)}
                                </p>
                            </div>

                            {/* Ticket Information */}
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <div className="flex justify-between mb-2">
                                    <span>Số lượng ghế</span>
                                    <span>{selectedSeats.length}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Ghế đã chọn</span>
                                    <span>{selectedSeats.length > 0 ? selectedSeats.join(', ') : '—'}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Giá vé</span>
                                    <span>{showtime.price.regular.toLocaleString('vi-VN')} đ</span>
                                </div>
                            </div>

                            {/* Promo Code */}
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <h3 className="font-semibold mb-2">Mã khuyến mãi</h3>

                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Nhập mã giảm giá"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                    />
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handlePromoCheck}
                                        isLoading={loading.checkingPromo}
                                        disabled={loading.checkingPromo || !promoCode.trim()}
                                    >
                                        Áp dụng
                                    </Button>
                                </div>

                                {error.promo && (
                                    <p className="text-red-500 text-sm mt-1">{error.promo}</p>
                                )}

                                {validPromo && (
                                    <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-md text-sm">
                                        <div className="font-semibold">Mã giảm giá hợp lệ!</div>
                                        <div>
                                            {validPromo.data?.name} - Giảm{' '}
                                            {promoDiscount.toLocaleString('vi-VN')} đ
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pricing Summary */}
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <span>Tạm tính:</span>
                                    <span>{calculateSubtotal().toLocaleString('vi-VN')} đ</span>
                                </div>

                                {promoDiscount > 0 && (
                                    <div className="flex justify-between mb-2 text-green-600">
                                        <span>Giảm giá:</span>
                                        <span>-{promoDiscount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-lg mt-2">
                                    <span>Tổng cộng:</span>
                                    <span>{calculateTotal().toLocaleString('vi-VN')} đ</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <Button
                                variant="primary"
                                fullWidth
                                size="lg"
                                onClick={handleProceedToCheckout}
                                disabled={selectedSeats.length === 0 || loading.proceedingToCheckout}
                                isLoading={loading.proceedingToCheckout}
                            >
                                Tiếp tục thanh toán
                            </Button>

                            <p className="text-sm text-gray-500 mt-4 text-center">
                                Khi tiếp tục, bạn đồng ý với các điều khoản sử dụng dịch vụ của chúng tôi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;