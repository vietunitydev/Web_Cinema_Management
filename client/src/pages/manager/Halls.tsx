// src/pages/manager/Halls.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cinemaService } from '../../services/cinemaService';
import type { Cinema, Hall } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const Halls: React.FC = () => {
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
    const [halls, setHalls] = useState<Hall[]>([]);
    const [loading, setLoading] = useState({
        cinemas: true,
        halls: false,
        action: false,
    });
    const [error, setError] = useState({
        cinemas: null,
        halls: null,
    });

    // Fetch cinemas when component mounts
    useEffect(() => {
        const fetchCinemas = async () => {
            try {
                const response = await cinemaService.getAllCinemas();
                const cinemasList = response.data?.data || [];
                setCinemas(cinemasList);

                // If cinemas exist, select the first one by default
                if (cinemasList.length > 0) {
                    setSelectedCinema(cinemasList[0]);
                }

                setError((prev) => ({ ...prev, cinemas: null }));
            } catch{
                setError((prev) => ({ ...prev, cinemas: 'Không thể tải danh sách rạp' }));
            } finally {
                setLoading((prev) => ({ ...prev, cinemas: false }));
            }
        };

        fetchCinemas();
    }, []);

    // Fetch halls when selected cinema changes
    useEffect(() => {
        const fetchHalls = async () => {
            if (!selectedCinema) {
                setHalls([]);
                return;
            }

            setLoading((prev) => ({ ...prev, halls: true }));

            try {
                const response = await cinemaService.getCinemaHalls(selectedCinema._id);
                setHalls(response.data || []);
                setError((prev) => ({ ...prev, halls: null }));
            } catch {
                setError((prev) => ({ ...prev, halls: 'Không thể tải danh sách phòng chiếu' }));
            } finally {
                setLoading((prev) => ({ ...prev, halls: false }));
            }
        };

        fetchHalls();
    }, [selectedCinema]);

    // Handle cinema selection change
    const handleCinemaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cinemaId = e.target.value;
        const cinema = cinemas.find((c) => c._id === cinemaId) || null;
        setSelectedCinema(cinema);
    };

    // Handle hall deletion
    const handleDeleteHall = async (hallId: string) => {
        if (!selectedCinema) return;

        if (window.confirm('Bạn có chắc muốn xóa phòng chiếu này? Hành động này không thể hoàn tác.')) {
            setLoading((prev) => ({ ...prev, action: true }));

            try {
                await cinemaService.deleteHall(selectedCinema._id, hallId);
                // Remove the hall from the list
                setHalls(halls.filter((hall) => hall.hallId !== hallId));
                toast.success('Xóa phòng chiếu thành công');
            } catch {
                toast.error('Không thể xóa phòng chiếu. Vui lòng thử lại.');
            } finally {
                setLoading((prev) => ({ ...prev, action: false }));
            }
        }
    };

    // Format the hall type for display
    const formatHallType = (type: string) => {
        switch (type) {
            case 'Regular':
                return 'Thường';
            case 'VIP':
                return 'VIP';
            case 'IMAX':
                return 'IMAX';
            case '4DX':
                return '4DX';
            default:
                return type;
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý phòng chiếu</h1>
                    <p className="text-gray-600">Quản lý thông tin phòng chiếu tại các rạp</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link to="/manager/halls/create">
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
                            Thêm phòng chiếu
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Cinema Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="mb-4">
                    <label htmlFor="cinema" className="block text-sm font-medium text-gray-700 mb-1">
                        Chọn rạp
                    </label>
                    {loading.cinemas ? (
                        <div className="py-2">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : error.cinemas ? (
                        <div className="text-red-500">{error.cinemas}</div>
                    ) : cinemas.length === 0 ? (
                        <div className="text-gray-500">Không có rạp nào</div>
                    ) : (
                        <select
                            id="cinema"
                            name="cinema"
                            value={selectedCinema?._id || ''}
                            onChange={handleCinemaChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {cinemas.map((cinema) => (
                                <option key={cinema._id} value={cinema._id}>
                                    {cinema.name} - {cinema.location.address}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {selectedCinema && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Thông tin rạp</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <p>
                                <span className="font-medium">Tên rạp:</span> {selectedCinema.name}
                            </p>
                            <p>
                                <span className="font-medium">Địa chỉ:</span> {selectedCinema.location.address}, {selectedCinema.location.city}
                            </p>
                            <p>
                                <span className="font-medium">Liên hệ:</span> {selectedCinema.contactInfo.phone}
                            </p>
                            <p>
                                <span className="font-medium">Giờ mở cửa:</span> {selectedCinema.openTime} - {selectedCinema.closeTime}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Halls List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Danh sách phòng chiếu</h2>
                </div>

                {!selectedCinema ? (
                    <div className="p-6 text-center text-gray-500">
                        Vui lòng chọn rạp để xem danh sách phòng chiếu
                    </div>
                ) : loading.halls ? (
                    <div className="p-8 flex justify-center">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error.halls ? (
                    <div className="p-6 text-center text-red-500">{error.halls}</div>
                ) : halls.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        Rạp này chưa có phòng chiếu nào
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
                                    Mã phòng
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Tên phòng
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Loại phòng
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Sức chứa
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Sơ đồ ghế
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
                            {halls.map((hall) => (
                                <tr key={hall.hallId}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{hall.hallId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{hall.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              hall.type === 'VIP'
                                  ? 'bg-purple-100 text-purple-800'
                                  : hall.type === 'IMAX'
                                      ? 'bg-blue-100 text-blue-800'
                                      : hall.type === '4DX'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {formatHallType(hall.type)}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{hall.capacity} ghế</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {hall.seatingArrangement.rows} hàng x {hall.seatingArrangement.seatsPerRow} ghế
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link to={`/manager/halls/${hall.hallId}/edit`}>
                                                <button className="text-indigo-600 hover:text-indigo-900">Sửa</button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteHall(hall.hallId)}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={loading.action}
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
            </div>
        </div>
    );
};

export default Halls;