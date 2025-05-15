// src/pages/admin/Promotions.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { promotionService } from '../../services/promotionService';
import type { Promotion } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { format } from 'date-fns';

const Promotions: React.FC = () => {
    // State
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    // Fetch promotions
    useEffect(() => {
        const fetchPromotions = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await promotionService.getAllPromotionsWithRole(currentPage, itemsPerPage);
                console.log(response);

                // Update state with fetched data
                if (response.data) {
                    let filteredPromotions = response.data.data;

                    // Apply filters
                    if (statusFilter) {
                        filteredPromotions = filteredPromotions.filter(promo => promo.status === statusFilter);
                    }

                    if (searchTerm) {
                        const term = searchTerm.toLowerCase();
                        filteredPromotions = filteredPromotions.filter(
                            promo =>
                                promo.name.toLowerCase().includes(term) ||
                                promo.couponCode.toLowerCase().includes(term) ||
                                promo.description.toLowerCase().includes(term)
                        );
                    }

                    setPromotions(filteredPromotions);
                    setTotalItems(response.data.totalCount);
                    setTotalPages(response.data.totalPages);
                }
            } catch{
                setError('Không thể tải danh sách khuyến mãi. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, [currentPage, statusFilter, searchTerm]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // Handle filter change
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    // Handle search form submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    // Clear filters
    const clearFilters = () => {
        setStatusFilter('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Handle delete promotion
    const handleDeletePromotion = (id: string) => {
        confirmAlert({
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc muốn xóa khuyến mãi này?',
            buttons: [
                {
                    label: 'Có',
                    onClick: async () => {
                        setActionLoading(true);
                        try {
                            await promotionService.deletePromotion(id);
                            setPromotions(promotions.filter(promo => promo._id !== id));
                            toast.success('Xóa khuyến mãi thành công');
                        } catch {
                            toast.error('Lỗi khi xóa khuyến mãi');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                },
                {
                    label: 'Không',
                    onClick: () => {}
                }
            ]
        });
    };

    // Handle update promotion status
    const handleUpdateAllStatus = async () => {
        confirmAlert({
            title: 'Cập nhật trạng thái',
            message: 'Cập nhật trạng thái tất cả khuyến mãi dựa trên thời gian hiện tại?',
            buttons: [
                {
                    label: 'Có',
                    onClick: async () => {
                        setActionLoading(true);
                        try {
                            const response = await promotionService.updateAllPromotionsStatus();
                            toast.success(`Đã cập nhật ${response.data?.updated || 0} khuyến mãi`);

                            // Reload promotions
                            const refreshResponse = await promotionService.getAllPromotions(currentPage, itemsPerPage);
                            if (refreshResponse.data) {
                                setPromotions(refreshResponse.data.data);
                                setTotalItems(refreshResponse.data.totalCount);
                                setTotalPages(refreshResponse.data.totalPages);
                            }
                        } catch {
                            toast.error('Lỗi khi cập nhật trạng thái khuyến mãi');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                },
                {
                    label: 'Không',
                    onClick: () => {}
                }
            ]
        });
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    // Format discount value
    const formatDiscount = (promotion: Promotion) => {
        switch (promotion.type) {
            case 'percentage':
                return `${promotion.value}%`;
            case 'fixed_amount':
                return `${promotion.value.toLocaleString('vi-VN')}đ`;
            case 'buy_one_get_one':
                return 'Mua 1 tặng 1';
            default:
                return `${promotion.value}`;
        }
    };

    // Get status color class
    const getStatusColorClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'upcoming':
                return 'bg-blue-100 text-blue-800';
            case 'expired':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Đang hoạt động';
            case 'upcoming':
                return 'Sắp diễn ra';
            case 'expired':
                return 'Đã hết hạn';
            default:
                return status;
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý khuyến mãi</h1>
                    <p className="text-gray-600">Quản lý chương trình khuyến mãi trong hệ thống</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={handleUpdateAllStatus}
                        disabled={actionLoading}
                    >
                        Cập nhật trạng thái
                    </Button>
                    <Link to="/admin/promotions/create">
                        <Button
                            variant="primary"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            }
                        >
                            Thêm khuyến mãi
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <form onSubmit={handleSearch}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                Tìm kiếm
                            </label>
                            <input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Tìm theo tên, mã khuyến mãi..."
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Trạng thái
                            </label>
                            <select
                                id="status"
                                name="status"
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={statusFilter}
                                onChange={handleFilterChange}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="upcoming">Sắp diễn ra</option>
                                <option value="expired">Đã hết hạn</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4 space-x-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={clearFilters}
                        >
                            Xóa bộ lọc
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                        >
                            Tìm kiếm
                        </Button>
                    </div>
                </form>
            </div>

            {/* Promotions Table */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-red-500">{error}</div>
                ) : promotions.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        Không tìm thấy khuyến mãi nào. Vui lòng thử lại với bộ lọc khác.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Tên khuyến mãi
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Mã khuyến mãi
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Giá trị
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Thời gian
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Lượt sử dụng
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Trạng thái
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Hành động
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {promotions.map((promotion) => (
                                <tr key={promotion._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-0">
                                                <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{promotion.description.substring(0, 50)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{promotion.couponCode}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{formatDiscount(promotion)}</div>
                                        {promotion.minPurchase && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Tối thiểu: {promotion.minPurchase.toLocaleString('vi-VN')}đ
                                            </div>
                                        )}
                                        {promotion.maxDiscount && (
                                            <div className="text-xs text-gray-500">
                                                Tối đa: {promotion.maxDiscount.toLocaleString('vi-VN')}đ
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatDate(promotion.startDate)}</div>
                                        <div className="text-sm text-gray-500">đến {formatDate(promotion.endDate)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{promotion.usageCount}/{promotion.usageLimit}</div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                            <div
                                                className="bg-primary h-2.5 rounded-full"
                                                style={{ width: `${(promotion.usageCount / promotion.usageLimit) * 100}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(promotion.status)}`}>
                                                {getStatusText(promotion.status)}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/admin/promotions/${promotion._id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Sửa
                                            </Link>
                                            <button
                                                className="text-red-600 hover:text-red-900"
                                                onClick={() => handleDeletePromotion(promotion._id)}
                                                disabled={actionLoading}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && promotions.length > 0 && (
                    <div className="py-4 px-6 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Promotions;