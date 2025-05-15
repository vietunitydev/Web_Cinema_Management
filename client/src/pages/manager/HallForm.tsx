import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cinemaService } from '../../services/cinemaService';
import type { Cinema, Hall } from '../../types/models';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

interface ErrorState {
    cinemas: string | null;
    hall: string | null;
    submit: string | null;
}

const HallForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;

    // Form data with hallId included
    const [formData, setFormData] = useState<Hall & { cinemaId: string }>({
        cinemaId: '',
        hallId: '',
        name: '',
        capacity: 0,
        type: 'Regular',
        seatingArrangement: {
            rows: 0,
            seatsPerRow: 0,
            format: [],
        },
    });

    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
    const [loading, setLoading] = useState({
        cinemas: true,
        hall: isEditing,
        submit: false,
    });
    const [error, setError] = useState<ErrorState>({
        cinemas: null,
        hall: null,
        submit: null,
    });

    // Fetch cinemas
    useEffect(() => {
        const fetchCinemas = async () => {
            try {
                const response = await cinemaService.getAllCinemas();
                const cinemasList = response.data?.data || [];
                setCinemas(cinemasList);

                if (cinemasList.length > 0 && !isEditing) {
                    setSelectedCinema(cinemasList[0]);
                    setFormData((prev) => ({ ...prev, cinemaId: cinemasList[0]._id }));
                }

                setError((prev) => ({ ...prev, cinemas: null }));
            } catch {
                setError((prev) => ({ ...prev, cinemas: 'Không thể tải danh sách rạp' }));
            } finally {
                setLoading((prev) => ({ ...prev, cinemas: false }));
            }
        };

        fetchCinemas();
    }, [isEditing]);

    // Fetch hall details if editing
    useEffect(() => {
        const fetchHall = async () => {
            if (!isEditing) return;

            try {
                let foundHall: Hall | null = null;
                let foundCinema: Cinema | null = null;

                for (const cinema of cinemas) {
                    try {
                        const hallsResponse = await cinemaService.getCinemaHalls(cinema._id);
                        const halls = hallsResponse.data || [];
                        const hall = halls.find((h) => h.hallId === id);

                        if (hall) {
                            foundHall = hall;
                            foundCinema = cinema;
                            break;
                        }
                    } catch {
                        continue;
                    }
                }

                if (foundHall && foundCinema) {
                    setSelectedCinema(foundCinema);
                    setFormData({
                        cinemaId: foundCinema._id,
                        hallId: foundHall.hallId,
                        name: foundHall.name,
                        capacity: foundHall.capacity,
                        type: foundHall.type,
                        seatingArrangement: foundHall.seatingArrangement,
                    });
                    setError((prev) => ({ ...prev, hall: null }));
                } else {
                    setError((prev) => ({ ...prev, hall: 'Không tìm thấy phòng chiếu' }));
                }
            } catch {
                setError((prev) => ({ ...prev, hall: 'Không thể tải thông tin phòng chiếu' }));
            } finally {
                setLoading((prev) => ({ ...prev, hall: false }));
            }
        };

        if (cinemas.length > 0) {
            fetchHall();
        }
    }, [id, isEditing, cinemas]);

    const handleCinemaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cinemaId = e.target.value;
        const cinema = cinemas.find((c) => c._id === cinemaId) || null;
        setSelectedCinema(cinema);
        setFormData((prev) => ({ ...prev, cinemaId }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'rows' || name === 'seatsPerRow') {
            const intValue = parseInt(value) || 0;
            setFormData((prev) => ({
                ...prev,
                seatingArrangement: {
                    ...prev.seatingArrangement,
                    [name]: intValue,
                },
                capacity: name === 'rows'
                    ? intValue * prev.seatingArrangement.seatsPerRow
                    : prev.seatingArrangement.rows * intValue,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: name === 'capacity' ? parseInt(value) || 0 : value,
            }));
        }
    };

    const generateSeatingFormat = () => {
        const { rows, seatsPerRow } = formData.seatingArrangement;
        const format: string[][] = [];

        for (let i = 0; i < rows; i++) {
            const rowLabel = String.fromCharCode(65 + i);
            const row: string[] = [];
            for (let j = 1; j <= seatsPerRow; j++) {
                row.push(`${rowLabel}${j}`);
            }
            format.push(row);
        }

        return format;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.cinemaId || !formData.hallId || !formData.name || formData.capacity <= 0) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (formData.seatingArrangement.rows <= 0 || formData.seatingArrangement.seatsPerRow <= 0) {
            toast.error('Vui lòng điền thông tin sơ đồ ghế');
            return;
        }

        const format = generateSeatingFormat();

        const hallData: Hall = {
            hallId: formData.hallId,
            name: formData.name,
            capacity: formData.capacity,
            type: formData.type,
            seatingArrangement: {
                ...formData.seatingArrangement,
                format,
            },
        };

        setLoading((prev) => ({ ...prev, submit: true }));
        setError((prev) => ({ ...prev, submit: null }));

        try {
            if (isEditing) {
                await cinemaService.updateHall(formData.cinemaId, id!, hallData);
                toast.success('Cập nhật phòng chiếu thành công');
            } else {
                await cinemaService.createHall(formData.cinemaId, hallData);
                toast.success('Tạo phòng chiếu mới thành công');
            }
            navigate('/manager/halls');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            setError((prev) => ({ ...prev, submit: errorMessage }));
            toast.error(errorMessage);
        } finally {
            setLoading((prev) => ({ ...prev, submit: false }));
        }
    };

    if ((isEditing && loading.hall) || loading.cinemas) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isEditing && error.hall) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">{error.hall}</h2>
                <Button variant="primary" onClick={() => navigate('/manager/halls')}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditing ? 'Chỉnh sửa phòng chiếu' : 'Thêm phòng chiếu mới'}
                </h1>
                <p className="text-gray-600">
                    {isEditing ? 'Cập nhật thông tin phòng chiếu' : 'Thêm phòng chiếu mới vào hệ thống'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                    <label htmlFor="cinemaId" className="block text-sm font-medium text-gray-700 mb-1">
                        R gomạp <span className="text-red-500">*</span>
                    </label>
                    {error.cinemas ? (
                        <div className="text-red-500 text-sm">{error.cinemas}</div>
                    ) : cinemas.length === 0 ? (
                        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                            Không có rạp nào trong hệ thống. Vui lòng thêm rạp trước.
                        </div>
                    ) : (
                        <select
                            id="cinemaId"
                            name="cinemaId"
                            value={formData.cinemaId}
                            onChange={handleCinemaChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                            disabled={isEditing}
                        >
                            <option value="">Chọn rạp</option>
                            {cinemas.map((cinema) => (
                                <option key={cinema._id} value={cinema._id}>
                                    {cinema.name} - {cinema.location.address}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="hallId" className="block text-sm font-medium text-gray-700 mb-1">
                            Mã phòng chiếu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="hallId"
                            name="hallId"
                            value={formData.hallId}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Ví dụ: HALL001"
                            required
                            disabled={isEditing}
                        />
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Tên phòng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Ví dụ: Phòng 1, Phòng VIP 2, ..."
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                            Loại phòng <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            <option value="Regular">Thường</option>
                            <option value="VIP">VIP</option>
                            <option value="IMAX">IMAX</option>
                            <option value="4DX">4DX</option>
                        </select>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Sơ đồ ghế</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="rows" className="block text-sm font-medium text-gray-700 mb-1">
                                Số hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="rows"
                                name="rows"
                                value={formData.seatingArrangement.rows}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Số hàng (A, B, C, ...)"
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="seatsPerRow" className="block text-sm font-medium text-gray-700 mb-1">
                                Số ghế mỗi hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="seatsPerRow"
                                name="seatsPerRow"
                                value={formData.seatingArrangement.seatsPerRow}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Số ghế mỗi hàng (1, 2, 3, ...)"
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                                Sức chứa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="capacity"
                                name="capacity"
                                value={formData.capacity}
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100"
                                placeholder="Tổng số ghế"
                                readOnly
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Tự động tính dựa trên số hàng và số ghế mỗi hàng
                            </p>
                        </div>
                    </div>
                </div>

                {formData.seatingArrangement.rows > 0 && formData.seatingArrangement.seatsPerRow > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Bản xem trước sơ đồ</h3>
                        <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                            <div className="mb-4 bg-gray-800 p-2 text-white text-center rounded-md">
                                Màn hình
                            </div>
                            <div className="grid gap-y-2">
                                {Array.from({ length: formData.seatingArrangement.rows }).map((_, rowIndex) => {
                                    const rowLabel = String.fromCharCode(65 + rowIndex);
                                    return (
                                        <div key={rowIndex} className="flex items-center">
                                            <div className="w-8 text-center font-semibold">{rowLabel}</div>
                                            <div className="flex space-x-2">
                                                {Array.from({ length: formData.seatingArrangement.seatsPerRow }).map((_, seatIndex) => (
                                                    <div
                                                        key={seatIndex}
                                                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md text-xs font-medium"
                                                    >
                                                        {seatIndex + 1}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="w-8 text-center font-semibold">{rowLabel}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Bản xem trước này cho thấy cách bố trí ghế trong phòng chiếu. Mỗi ô đại diện cho một ghế.
                        </p>
                    </div>
                )}

                {error.submit && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
                        {error.submit}
                    </div>
                )}

                <div className="flex justify-end space-x-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate('/manager/halls')}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={loading.submit}
                        disabled={loading.submit || cinemas.length === 0}
                    >
                        {isEditing ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default HallForm;