// src/pages/admin/Reviews.tsx
import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/reviewService';
import type { Review } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

const AdminReviews: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState({
        all: true,
        pending: true,
        action: false
    });
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('pending');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        status: 'all',
        movieId: '',
        search: ''
    });

    useEffect(() => {
        if (activeTab === 'all') {
            fetchAllReviews();
        } else {
            fetchPendingReviews();
        }
    }, [activeTab, currentPage, filters]);

    const fetchAllReviews = async () => {
        try {
            setLoading(prev => ({ ...prev, all: true }));
            const response = await reviewService.getAllReviews(undefined, currentPage, 10);
            setReviews(response.data.data || []);
            setTotalPages(response.data.totalPages || 1);
        } catch {
            setError('Không thể tải danh sách đánh giá');
        } finally {
            setLoading(prev => ({ ...prev, all: false }));
        }
    };

    const fetchPendingReviews = async () => {
        try {
            setLoading(prev => ({ ...prev, pending: true }));
            const response = await reviewService.getPendingReviews(currentPage, 10);
            setPendingReviews(response.data.data || []);
            setTotalPages(response.data.totalPages || 1);
        } catch {
            setError('Không thể tải danh sách đánh giá chờ duyệt');
        } finally {
            setLoading(prev => ({ ...prev, pending: false }));
        }
    };

    const handleApprove = async (reviewId: string) => {
        setLoading(prev => ({ ...prev, action: true }));
        try {
            await reviewService.approveReview(reviewId);
            toast.success('Đánh giá đã được duyệt');

            if (activeTab === 'pending') {
                fetchPendingReviews();
            } else {
                fetchAllReviews();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi duyệt đánh giá');
        } finally {
            setLoading(prev => ({ ...prev, action: false }));
        }
    };

    const handleReject = async (reviewId: string) => {
        if (!confirm('Bạn có chắc chắn muốn từ chối đánh giá này?')) return;

        setLoading(prev => ({ ...prev, action: true }));
        try {
            await reviewService.rejectReview(reviewId);
            toast.success('Đánh giá đã bị từ chối');

            if (activeTab === 'pending') {
                fetchPendingReviews();
            } else {
                fetchAllReviews();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối đánh giá');
        } finally {
            setLoading(prev => ({ ...prev, action: false }));
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-4 h-4 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                ))}
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
            approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
            rejected: { label: 'Bị từ chối', className: 'bg-red-100 text-red-800' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentReviews = activeTab === 'all' ? reviews : pendingReviews;
    const isLoading = activeTab === 'all' ? loading.all : loading.pending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Quản lý đánh giá
                </h1>
                <p className="text-gray-600">
                    Duyệt và quản lý đánh giá từ khách hàng
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex">
                        <button
                            onClick={() => {
                                setActiveTab('pending');
                                setCurrentPage(1);
                            }}
                            className={`py-4 px-6 text-sm font-medium border-b-2 ${
                                activeTab === 'pending'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Chờ duyệt
                            {pendingReviews.length > 0 && (
                                <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                                    {pendingReviews.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('all');
                                setCurrentPage(1);
                            }}
                            className={`py-4 px-6 text-sm font-medium border-b-2 ${
                                activeTab === 'all'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Tất cả đánh giá
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-500 mb-4">{error}</p>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setError(null);
                                    if (activeTab === 'all') {
                                        fetchAllReviews();
                                    } else {
                                        fetchPendingReviews();
                                    }
                                }}
                            >
                                Thử lại
                            </Button>
                        </div>
                    ) : currentReviews.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-4">
                                <svg
                                    className="w-16 h-16 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {activeTab === 'pending' ? 'Không có đánh giá nào chờ duyệt' : 'Chưa có đánh giá nào'}
                            </h3>
                            <p className="text-gray-500">
                                {activeTab === 'pending'
                                    ? 'Tất cả đánh giá đã được xử lý.'
                                    : 'Chưa có đánh giá nào từ khách hàng.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentReviews.map((review) => (
                                <div key={review._id} className="border border-gray-200 rounded-lg p-6">
                                    {/* Review Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            {review.movieId.posterUrl && (
                                                <img
                                                    src={review.movieId.posterUrl}
                                                    alt={review.movieId.title}
                                                    className="w-12 h-18 object-cover rounded"
                                                />
                                            )}
                                            <div>
                                                <h4 className="font-semibold text-gray-900">
                                                    {review.movieId.title}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    Đánh giá bởi: {review.userId.fullName}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    {renderStars(review.rating)}
                                                    <span className="text-sm text-gray-600">
                                                        {review.rating}/5
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusBadge(review.status)}
                                            <span className="text-sm text-gray-500">
                                                {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Review Content */}
                                    <div className="mb-4">
                                        {review.title && (
                                            <h5 className="font-medium text-gray-900 mb-2">
                                                {review.title}
                                            </h5>
                                        )}
                                        <p className="text-gray-700 leading-relaxed">
                                            {review.content}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    {review.status === 'pending' && (
                                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReject(review._id)}
                                                disabled={loading.action}
                                                className="text-red-600 border-red-300 hover:bg-red-50"
                                            >
                                                Từ chối
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleApprove(review._id)}
                                                loading={loading.action}
                                            >
                                                Phê duyệt
                                            </Button>
                                        </div>
                                    )}

                                    {review.status === 'approved' && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex items-center text-sm text-green-600">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Đã được phê duyệt và hiển thị công khai
                                            </div>
                                        </div>
                                    )}

                                    {review.status === 'rejected' && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex items-center text-sm text-red-600">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Đã bị từ chối và không hiển thị công khai
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <nav className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Trước
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                                            currentPage === page
                                                ? 'text-white bg-primary border border-primary'
                                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Sau
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReviews;