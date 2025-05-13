// src/pages/customer/Promotions.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { promotionService } from '../../services/promotionService';
import type { Promotion } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';

const Promotions: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming'>('active');

    // Fetch promotions on component mount
    useEffect(() => {
        const fetchPromotions = async () => {
            setLoading(true);
            try {
                const response = await promotionService.getAllPromotions();
                setPromotions(response.data?.data || []);
                setError(null);
            } catch (err) {
                setError('Không thể tải danh sách khuyến mãi');
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'dd/MM/yyyy', { locale: vi });
    };

    // Handle copy coupon code to clipboard
    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code)
            .then(() => {
                setCopiedCode(code);
                toast.success('Đã sao chép mã khuyến mãi!');

                // Reset the copied state after 3 seconds
                setTimeout(() => {
                    setCopiedCode(null);
                }, 3000);
            })
            .catch(() => {
                toast.error('Không thể sao chép mã khuyến mãi');
            });
    };

    // Calculate remaining days for a promotion
    const getRemainingDays = (endDateString: string) => {
        const today = new Date();
        const endDate = new Date(endDateString);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get promotion discount text
    const getDiscountText = (promotion: Promotion) => {
        switch (promotion.type) {
            case 'percentage':
                return `Giảm ${promotion.value}%`;
            case 'fixed_amount':
                return `Giảm ${promotion.value.toLocaleString('vi-VN')}đ`;
            case 'buy_one_get_one':
                return 'Mua 1 tặng 1';
            default:
                return 'Khuyến mãi';
        }
    };

    // Filter promotions based on status
    const filteredPromotions = promotions.filter(promotion => {
        const today = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);

        if (filterStatus === 'all') return true;
        if (filterStatus === 'active') return today >= startDate && today <= endDate;
        if (filterStatus === 'upcoming') return today < startDate;

        return true;
    });

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">Ưu đãi & Khuyến mãi</h1>
                    <p className="text-gray-600 mb-8">Khám phá các ưu đãi hấp dẫn dành cho bạn</p>

                    {/* Filter Tabs */}
                    <div className="bg-white shadow-sm rounded-lg mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="flex">
                                <button
                                    onClick={() => setFilterStatus('active')}
                                    className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                                        filterStatus === 'active'
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Đang diễn ra
                                </button>
                                <button
                                    onClick={() => setFilterStatus('upcoming')}
                                    className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                                        filterStatus === 'upcoming'
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Sắp tới
                                </button>
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                                        filterStatus === 'all'
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Tất cả
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Featured Banner */}
                    <div className="mb-10 rounded-lg overflow-hidden shadow-sm bg-gradient-to-r from-purple-600 to-blue-500 text-white">
                        <div className="flex flex-col md:flex-row">
                            <div className="p-6 md:p-10 flex-grow">
                                <div className="max-w-lg">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Đăng ký thành viên - Nhận ưu đãi đặc biệt</h2>
                                    <p className="mb-6">Trở thành thành viên của CinemaHub để nhận ngay các ưu đãi độc quyền và tích lũy điểm với mỗi lần đặt vé!</p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link to="/register">
                                            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600 transition-colors">
                                                Đăng ký ngay
                                            </Button>
                                        </Link>
                                        <Link to="/movies">
                                            <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                                                Đặt vé
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block w-1/3 bg-center bg-cover" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2luZW1hJTIwdGlja2V0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60)' }}></div>
                        </div>
                    </div>

                    {/* Promotions List */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : filteredPromotions.length === 0 ? (
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
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Không có khuyến mãi nào</h3>
                            <p className="mt-1 text-gray-500">
                                {filterStatus === 'active'
                                    ? 'Hiện tại không có khuyến mãi nào đang diễn ra.'
                                    : filterStatus === 'upcoming'
                                        ? 'Hiện tại không có khuyến mãi nào sắp diễn ra.'
                                        : 'Không tìm thấy khuyến mãi nào.'}
                            </p>
                            <div className="mt-6">
                                <Link to="/movies">
                                    <Button variant="primary">Xem phim đang chiếu</Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredPromotions.map((promotion) => {
                                const isActive = new Date() >= new Date(promotion.startDate) && new Date() <= new Date(promotion.endDate);
                                const isUpcoming = new Date() < new Date(promotion.startDate);
                                const remainingDays = isActive ? getRemainingDays(promotion.endDate) : null;

                                return (
                                    <div
                                        key={promotion._id}
                                        className={`bg-white rounded-lg shadow-sm overflow-hidden border ${
                                            isActive ? 'border-green-200' : isUpcoming ? 'border-blue-200' : 'border-gray-200'
                                        }`}
                                    >
                                        <div className={`px-6 py-4 border-b ${
                                            isActive ? 'bg-green-50 border-green-100' :
                                                isUpcoming ? 'bg-blue-50 border-blue-100' :
                                                    'bg-gray-50 border-gray-100'
                                        }`}>
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-bold">{promotion.name}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    isActive ? 'bg-green-100 text-green-800' :
                                                        isUpcoming ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                          {isActive ? 'Đang diễn ra' : isUpcoming ? 'Sắp diễn ra' : 'Đã kết thúc'}
                        </span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="mb-4">
                                                <p className="text-gray-600">{promotion.description}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-500 mb-4">
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</span>
                                                </div>

                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                                                    </svg>
                                                    <span>{getDiscountText(promotion)}</span>
                                                </div>

                                                {promotion.minPurchase && (
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Đơn tối thiểu {promotion.minPurchase.toLocaleString('vi-VN')}đ</span>
                                                    </div>
                                                )}

                                                {promotion.maxDiscount && (
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        <span>Giảm tối đa {promotion.maxDiscount.toLocaleString('vi-VN')}đ</span>
                                                    </div>
                                                )}
                                            </div>

                                            {remainingDays !== null && remainingDays <= 7 && (
                                                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-100 rounded-md text-sm text-yellow-800">
                                                    <strong>Sắp hết hạn!</strong> Chỉ còn {remainingDays} ngày nữa
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex-grow mr-4">
                                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                        <div className="flex-grow p-3 bg-gray-50 font-mono text-center">{promotion.couponCode}</div>
                                                        <button
                                                            onClick={() => handleCopyCode(promotion.couponCode)}
                                                            className={`px-4 py-3 ${copiedCode === promotion.couponCode ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                        >
                                                            {copiedCode === promotion.couponCode ? (
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                <Link to="/movies">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        disabled={!isActive}
                                                    >
                                                        Đặt vé ngay
                                                    </Button>
                                                </Link>
                                            </div>

                                            {promotion.usageLimit && (
                                                <div className="mt-3 text-xs text-gray-500 flex justify-between">
                                                    <span>Đã sử dụng: {promotion.usageCount}/{promotion.usageLimit}</span>
                                                    <span>Còn lại: {promotion.usageLimit - promotion.usageCount}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* How to use promotions section */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6">Cách sử dụng mã khuyến mãi</h2>

                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white mb-4">
                                            <span className="text-xl font-bold">1</span>
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">Sao chép mã</h3>
                                        <p className="text-gray-600">Nhấn vào nút sao chép bên cạnh mã khuyến mãi để lưu vào bộ nhớ tạm</p>
                                    </div>

                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white mb-4">
                                            <span className="text-xl font-bold">2</span>
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">Chọn phim và ghế</h3>
                                        <p className="text-gray-600">Tiến hành đặt vé như bình thường và chọn ghế bạn muốn</p>
                                    </div>

                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white mb-4">
                                            <span className="text-xl font-bold">3</span>
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">Nhập mã khi thanh toán</h3>
                                        <p className="text-gray-600">Dán mã khuyến mãi vào ô mã giảm giá trong trang thanh toán</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="mt-10 bg-gray-50 rounded-lg p-6 text-sm text-gray-600">
                        <h3 className="text-base font-semibold mb-3">Điều khoản & Điều kiện:</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Mỗi mã khuyến mãi chỉ được sử dụng một lần cho mỗi tài khoản.</li>
                            <li>Khuyến mãi không được áp dụng đồng thời với các ưu đãi khác.</li>
                            <li>CinemaHub có quyền thay đổi điều khoản và điều kiện bất kỳ lúc nào mà không cần thông báo trước.</li>
                            <li>Khuyến mãi chỉ áp dụng cho đặt vé trực tuyến trên website hoặc ứng dụng di động CinemaHub.</li>
                            <li>Đối với một số khuyến mãi đặc biệt, có thể áp dụng các điều kiện bổ sung.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Promotions;