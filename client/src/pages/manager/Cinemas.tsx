// src/pages/manager/Cinemas.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cinemaService } from '../../services/cinemaService';
import type { Cinema } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const Cinemas: React.FC = () => {
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch cinemas when component mounts
    useEffect(() => {
        fetchCinemas();
    }, []);

    const fetchCinemas = async () => {
        try {
            setLoading(true);
            const response = await cinemaService.getAllCinemas();
            const cinemasList = response.data?.data || [];
            setCinemas(cinemasList);
            setError(null);
        } catch {
            setError('Không thể tải danh sách rạp. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Handle cinema deletion
    const handleDeleteCinema = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa rạp này? Hành động này không thể hoàn tác.')) {
            setActionLoading(true);

            try {
                await cinemaService.deleteCinema(id);
                // Remove the cinema from the list
                setCinemas(cinemas.filter((cinema) => cinema._id !== id));
                toast.success('Xóa rạp thành công');
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || 'Không thể xóa rạp. Vui lòng thử lại.';
                toast.error(errorMessage);
            } finally {
                setActionLoading(false);
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý rạp chiếu phim</h1>
                    <p className="text-gray-600">Quản lý thông tin các rạp chiếu phim trong hệ thống</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link to="/manager/cinemas/create">
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
                            Thêm rạp mới
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Cinemas List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Danh sách rạp chiếu phim</h2>
                </div>

                {loading ? (
                    <div className="p-8 flex justify-center">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-red-500">{error}</div>
                ) : cinemas.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        Chưa có rạp chiếu phim nào trong hệ thống
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
                                    Tên rạp
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Địa chỉ
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Thành phố
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Liên hệ
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Giờ hoạt động
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Phòng chiếu
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
                            {cinemas.map((cinema) => (
                                <tr key={cinema._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{cinema.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{cinema.location.address}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{cinema.location.city}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{cinema.contactInfo.phone}</div>
                                        <div className="text-sm text-gray-500">{cinema.contactInfo.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {cinema.openTime} - {cinema.closeTime}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {cinema.halls?.length || 0} phòng
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    cinema.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {cinema.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link to={`/manager/cinemas/${cinema._id}/edit`}>
                                                <button className="text-indigo-600 hover:text-indigo-900">
                                                    Sửa
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteCinema(cinema._id)}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={actionLoading}
                                            >
                                                Xóa
                                            </button>
                                            <Link to={`/manager/cinemas/${cinema._id}/halls`}>
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    Phòng chiếu
                                                </button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cinemas;