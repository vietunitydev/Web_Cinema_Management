// src/pages/VerifyBooking.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../types/models';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const VerifyBooking: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'valid' | 'invalid' | 'expired' | 'pending' | null>(null);
    const [verificationMessage, setVerificationMessage] = useState<string>('');

    useEffect(() => {
        const verifyBooking = async () => {
            if (!id) {
                setError('Mã đặt vé không hợp lệ');
                setLoading(false);
                return;
            }

            try {
                // Gọi API để xác thực booking
                const response = await bookingService.verifyBookingId(id);
                // console.log(response);

                // Kiểm tra nếu không có dữ liệu
                if (!response.data || !response.data.booking) {
                    setVerificationStatus('invalid');
                    setError('Vé không tồn tại');
                    setLoading(false);
                    return;
                }

                // Lấy dữ liệu từ response
                const { booking: bookingData, verification } = response.data;
                setBooking(bookingData);
                setVerificationStatus(verification.status);
                setVerificationMessage(verification.message);

                setLoading(false);
            } catch (err) {
                setError('Không thể xác thực vé. Vui lòng thử lại sau.');
                setVerificationStatus('invalid');
                setLoading(false);
            }
        };

        verifyBooking();
    }, [id]);

    // Format date and time
    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return format(date, 'EEEE, dd/MM/yyyy - HH:mm', { locale: vi });
    };

    // Get verification status color and text
    const getVerificationDisplay = () => {
        switch (verificationStatus) {
            case 'valid':
                return {
                    bgColor: 'bg-green-500',
                    textColor: 'text-green-600',
                    icon: (
                        <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    title: 'Vé hợp lệ',
                    message: verificationMessage || 'Vé điện tử này có hiệu lực và có thể sử dụng.'
                };
            case 'expired':
                return {
                    bgColor: 'bg-yellow-500',
                    textColor: 'text-yellow-600',
                    icon: (
                        <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 13.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    ),
                    title: 'Vé đã hết hạn',
                    message: verificationMessage || 'Suất chiếu đã kết thúc. Vé này không còn hiệu lực.'
                };
            case 'pending':
                return {
                    bgColor: 'bg-blue-500',
                    textColor: 'text-blue-600',
                    icon: (
                        <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l1.5 1.5m-1.5 2.5a7 7 0 100-14 7 7 0 000 14z" />
                        </svg>
                    ),
                    title: 'Vé đang chờ xác nhận',
                    message: verificationMessage || 'Vé chưa được xác nhận thanh toán.'
                };
            case 'invalid':
            default:
                return {
                    bgColor: 'bg-red-500',
                    textColor: 'text-red-600',
                    icon: (
                        <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    title: 'Vé không hợp lệ',
                    message: verificationMessage || 'Vé điện tử này không tồn tại hoặc đã bị hủy.'
                };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const verificationDisplay = getVerificationDisplay();

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Verification Status Header */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                        <div className={`${verificationDisplay.bgColor} text-white p-6 text-center`}>
                            {verificationDisplay.icon}
                            <h2 className="text-3xl font-bold mt-2">{verificationDisplay.title}</h2>
                            <p className="text-xl mt-1">{verificationDisplay.message}</p>
                        </div>

                        {/* Booking Details */}
                        {booking && verificationStatus !== 'invalid' && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-4">Thông tin vé</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-gray-600">Mã đặt vé</p>
                                        <p className="font-semibold">{booking.bookingCode || `BK-${booking._id.slice(-8).toUpperCase()}`}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Trạng thái</p>
                                        <p className={`font-semibold ${verificationDisplay.textColor}`}>
                                            {verificationDisplay.title}
                                        </p>
                                    </div>
                                </div>

                                {booking.movieId && (
                                    <div className="flex mb-6">
                                        <div className="w-24 h-36 flex-shrink-0 rounded overflow-hidden mr-4">
                                            <img
                                                src={booking.movieId.posterUrl}
                                                alt={booking.movieId.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-2">{booking.movieId.title}</h4>
                                            <p className="mb-1">
                                                <span className="text-gray-600">Rạp:</span>{' '}
                                                <span className="font-medium">{booking.cinemaId?.name || 'N/A'}</span>
                                            </p>
                                            <p className="mb-1">
                                                <span className="text-gray-600">Suất chiếu:</span>{' '}
                                                <span className="font-medium">
                                                    {booking.showtimeId ? formatDateTime(booking.showtimeId.startTime) : 'N/A'}
                                                </span>
                                            </p>
                                            <p className="mb-1">
                                                <span className="text-gray-600">Ghế:</span>{' '}
                                                <span className="font-medium">{booking.seats.join(', ')}</span>
                                            </p>
                                            <p>
                                                <span className="text-gray-600">Tổng tiền:</span>{' '}
                                                <span className="font-medium">{booking.finalAmount.toLocaleString('vi-VN')} đ</span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Notes */}
                                {verificationStatus === 'valid' && (
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-green-800">Vé được xác thực thành công</h3>
                                                <div className="mt-2 text-sm text-green-700">
                                                    <p>
                                                        Vé này có hiệu lực và khách hàng có thể vào rạp xem phim.
                                                        Vui lòng kiểm tra thông tin suất chiếu và ghế ngồi.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {verificationStatus === 'expired' && (
                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">Vé đã hết hiệu lực</h3>
                                                <div className="mt-2 text-sm text-yellow-700">
                                                    <p>
                                                        Suất chiếu đã kết thúc. Vé này không thể sử dụng để vào rạp.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {verificationStatus === 'pending' && (
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 01-2 0V7zm1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-blue-800">Vé đang chờ xác nhận</h3>
                                                <div className="mt-2 text-sm text-blue-700">
                                                    <p>
                                                        Vé này chưa được xác nhận thanh toán. Vui lòng kiểm tra trạng thái thanh toán trước khi cho phép vào rạp.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center mt-6">
                                    <Link to="/">
                                        <Button variant="primary">Về trang chủ</Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Error state */}
                        {verificationStatus === 'invalid' && (
                            <div className="p-6 text-center">
                                <p className="text-gray-600 mb-6">
                                    {error || 'Vé điện tử này không hợp lệ hoặc đã bị hủy.'}
                                </p>
                                <Link to="/">
                                    <Button variant="primary">Về trang chủ</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Instructions for staff */}
                    {verificationStatus === 'valid' && (
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-800 mb-3">Hướng dẫn cho nhân viên</h3>
                            <ul className="text-sm text-blue-700 space-y-2">
                                <li>• Kiểm tra thông tin khách hàng với giấy tờ tùy thân</li>
                                <li>• Xác nhận suất chiếu và số ghế trước khi hướng dẫn khách vào rạp</li>
                                <li>• Vé đã được xác thực thành công vào lúc: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyBooking;