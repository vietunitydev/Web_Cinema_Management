// src/pages/manager/CinemaForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cinemaService } from '../../services/cinemaService';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

interface CinemaFormData {
    name: string;
    location: {
        address: string;
        city: string;
    };
    contactInfo: {
        phone: string;
        email: string;
    };
    facilities: string[];
    openTime: string;
    closeTime: string;
    isActive: boolean;
}

const CinemaForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;

    // Form data
    const [formData, setFormData] = useState<CinemaFormData>({
        name: '',
        location: {
            address: '',
            city: '',
        },
        contactInfo: {
            phone: '',
            email: '',
        },
        facilities: [],
        openTime: '08:00',
        closeTime: '23:00',
        isActive: true,
    });

    // New facility input
    const [newFacility, setNewFacility] = useState('');

    // Form states
    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch cinema details when editing
    useEffect(() => {
        const fetchCinema = async () => {
            if (!isEditing) return;

            try {
                setLoading(true);
                const response = await cinemaService.getCinemaById(id!);
                const cinema = response.data;
                // console.log(response.data);

                if (cinema) {
                    setFormData({
                        name: cinema.name || '',
                        location: {
                            address: cinema.location?.address || '',
                            city: cinema.location?.city || '',
                        },
                        contactInfo: {
                            phone: cinema.contactInfo?.phone || '',
                            email: cinema.contactInfo?.email || '',
                        },
                        facilities: cinema.facilities || [],
                        openTime: cinema.openTime || '08:00',
                        closeTime: cinema.closeTime || '23:00',
                        isActive: cinema.isActive !== undefined ? cinema.isActive : true,
                    });
                    setError(null);
                }
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || 'Không thể tải thông tin rạp';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchCinema();
    }, [id, isEditing]);

    // Handle form field changes
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        // Handle nested fields
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent as keyof CinemaFormData],
                    [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
                },
            });
        } else {
            // Handle checkbox
            if (type === 'checkbox') {
                setFormData({
                    ...formData,
                    [name]: (e.target as HTMLInputElement).checked,
                });
            } else {
                // Handle other inputs
                setFormData({
                    ...formData,
                    [name]: value,
                });
            }
        }
    };

    // Add new facility
    const handleAddFacility = () => {
        if (newFacility.trim() !== '' && !formData.facilities.includes(newFacility.trim())) {
            setFormData({
                ...formData,
                facilities: [...formData.facilities, newFacility.trim()],
            });
            setNewFacility('');
        }
    };

    // Remove facility
    const handleRemoveFacility = (facility: string) => {
        setFormData({
            ...formData,
            facilities: formData.facilities.filter((f) => f !== facility),
        });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.location.address || !formData.location.city) {
            toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            if (isEditing) {
                // Update existing cinema
                await cinemaService.updateCinema(id!, formData);
                toast.success('Cập nhật rạp thành công');
            } else {
                // Create new cinema
                await cinemaService.createCinema(formData);
                toast.success('Tạo rạp mới thành công');
            }
            navigate('/manager/cinemas');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // Show loading spinner when fetching data
    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditing ? 'Chỉnh sửa rạp chiếu phim' : 'Thêm rạp chiếu phim mới'}
                </h1>
                <p className="text-gray-600">
                    {isEditing
                        ? 'Cập nhật thông tin rạp chiếu phim'
                        : 'Thêm rạp chiếu phim mới vào hệ thống'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Basic Cinema Information */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin cơ bản</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Tên rạp <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Nhập tên rạp"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="isActive" className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">Đang hoạt động</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Địa điểm</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="location.address" className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="location.address"
                                name="location.address"
                                value={formData.location.address}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Nhập địa chỉ"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-1">
                                Thành phố <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="location.city"
                                name="location.city"
                                value={formData.location.city}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Nhập thành phố"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin liên hệ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="contactInfo.phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Số điện thoại
                            </label>
                            <input
                                type="text"
                                id="contactInfo.phone"
                                name="contactInfo.phone"
                                value={formData.contactInfo.phone}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                        <div>
                            <label htmlFor="contactInfo.email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="contactInfo.email"
                                name="contactInfo.email"
                                value={formData.contactInfo.email}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Nhập email"
                            />
                        </div>
                    </div>
                </div>

                {/* Operation Hours */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Giờ hoạt động</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="openTime" className="block text-sm font-medium text-gray-700 mb-1">
                                Giờ mở cửa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="openTime"
                                name="openTime"
                                value={formData.openTime}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="closeTime" className="block text-sm font-medium text-gray-700 mb-1">
                                Giờ đóng cửa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="closeTime"
                                name="closeTime"
                                value={formData.closeTime}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Facilities */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Tiện ích</h2>
                    <div className="mb-4">
                        <div className="flex">
                            <input
                                type="text"
                                value={newFacility}
                                onChange={(e) => setNewFacility(e.target.value)}
                                placeholder="Nhập tiện ích (ví dụ: 4DX, IMAX, Food Court...)"
                                className="flex-1 rounded-l-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                type="button"
                                onClick={handleAddFacility}
                                disabled={!newFacility.trim()}
                                className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark disabled:bg-gray-300"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.facilities.map((facility, index) => (
                            <div
                                key={index}
                                className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center"
                            >
                                <span>{facility}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFacility(facility)}
                                    className="ml-2 text-gray-500 hover:text-red-500"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                        {formData.facilities.length === 0 && (
                            <p className="text-gray-500 text-sm">Chưa có tiện ích nào</p>
                        )}
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
                        {error}
                    </div>
                )}

                {/* Form actions */}
                <div className="flex justify-end space-x-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate('/manager/cinemas')}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={submitting}
                        disabled={submitting}
                    >
                        {isEditing ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CinemaForm;