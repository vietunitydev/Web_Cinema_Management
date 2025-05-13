// src/pages/admin/PromotionForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { promotionService } from '../../services/promotionService';
import { movieService } from '../../services/movieService';
import { cinemaService } from '../../services/cinemaService';
import type { Promotion, Movie, Cinema } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

interface PromotionFormValues {
    name: string;
    description: string;
    type: 'percentage' | 'fixed_amount' | 'buy_one_get_one';
    value: number;
    minPurchase: number;
    maxDiscount: number;
    startDate: string;
    endDate: string;
    couponCode: string;
    usageLimit: number;
    applicableMovies: string[];
    applicableCinemas: string[];
    applicableDaysOfWeek: string[];
    status: 'active' | 'upcoming' | 'expired';
}

const PromotionForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [promotion, setPromotion] = useState<Promotion | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [loading, setLoading] = useState(isEditing);
    const [dataLoading, setDataLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch movies and cinemas for selection lists
    useEffect(() => {
        const fetchReferenceData = async () => {
            setDataLoading(true);
            try {
                // Fetch movies
                const moviesResponse = await movieService.getAllMovies();
                if (moviesResponse.data) {
                    setMovies(moviesResponse.data.data || []);
                }

                // Fetch cinemas
                const cinemasResponse = await cinemaService.getAllCinemas();
                if (cinemasResponse.data) {
                    setCinemas(cinemasResponse.data.data || []);
                }
            } catch (err) {
                console.error('Error fetching reference data:', err);
            } finally {
                setDataLoading(false);
            }
        };

        fetchReferenceData();
    }, []);

    // Fetch promotion details if editing
    useEffect(() => {
        const fetchPromotion = async () => {
            if (!isEditing) return;

            try {
                const response = await promotionService.getPromotionById(id);
                if (response.data) {
                    setPromotion(response.data);
                } else {
                    setError('Không tìm thấy thông tin khuyến mãi');
                }
            } catch (err) {
                setError('Lỗi khi tải thông tin khuyến mãi');
            } finally {
                setLoading(false);
            }
        };

        fetchPromotion();
    }, [id, isEditing]);

    // Get days of week options
    const daysOfWeek = [
        { value: 'monday', label: 'Thứ 2' },
        { value: 'tuesday', label: 'Thứ 3' },
        { value: 'wednesday', label: 'Thứ 4' },
        { value: 'thursday', label: 'Thứ 5' },
        { value: 'friday', label: 'Thứ 6' },
        { value: 'saturday', label: 'Thứ 7' },
        { value: 'sunday', label: 'Chủ nhật' },
    ];

    // Set up formik with validation
    const formik = useFormik<PromotionFormValues>({
        initialValues: {
            name: '',
            description: '',
            type: 'percentage',
            value: 0,
            minPurchase: 0,
            maxDiscount: 0,
            startDate: '',
            endDate: '',
            couponCode: '',
            usageLimit: 100,
            applicableMovies: ['all'],
            applicableCinemas: ['all'],
            applicableDaysOfWeek: ['all'],
            status: 'upcoming',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Tên khuyến mãi là bắt buộc'),
            description: Yup.string().required('Mô tả khuyến mãi là bắt buộc'),
            type: Yup.string()
                .oneOf(['percentage', 'fixed_amount', 'buy_one_get_one'], 'Loại khuyến mãi không hợp lệ')
                .required('Loại khuyến mãi là bắt buộc'),
            value: Yup.number()
                .when('type', {
                    is: (val: string) => val !== 'buy_one_get_one',
                    then: (schema) => schema.required('Giá trị khuyến mãi là bắt buộc')
                        .min(0, 'Giá trị khuyến mãi phải lớn hơn hoặc bằng 0'),
                    otherwise: (schema) => schema.notRequired(),
                }),
            minPurchase: Yup.number()
                .min(0, 'Giá trị mua tối thiểu phải lớn hơn hoặc bằng 0'),
            maxDiscount: Yup.number()
                .min(0, 'Giá trị giảm tối đa phải lớn hơn hoặc bằng 0'),
            startDate: Yup.date().required('Ngày bắt đầu là bắt buộc'),
            endDate: Yup.date()
                .min(
                    Yup.ref('startDate'),
                    'Ngày kết thúc phải sau ngày bắt đầu'
                )
                .required('Ngày kết thúc là bắt buộc'),
            couponCode: Yup.string()
                .matches(/^[A-Z0-9_-]+$/, 'Mã khuyến mãi chỉ được chứa chữ cái in hoa, số và ký tự _ -')
                .required('Mã khuyến mãi là bắt buộc'),
            usageLimit: Yup.number()
                .required('Giới hạn sử dụng là bắt buộc')
                .min(1, 'Giới hạn sử dụng phải lớn hơn 0'),
            status: Yup.string()
                .oneOf(['active', 'upcoming', 'expired'], 'Trạng thái không hợp lệ')
                .required('Trạng thái là bắt buộc'),
        }),
        onSubmit: async (values) => {
            setSubmitting(true);

            try {
                // Prepare data for API
                const promotionData: Partial<PromotionFormValues> = { ...values };

                if (isEditing) {
                    await promotionService.updatePromotion(id, promotionData);
                    toast.success('Cập nhật khuyến mãi thành công');
                } else {
                    await promotionService.createPromotion(promotionData as any); // Type cast needed here
                    toast.success('Thêm khuyến mãi mới thành công');
                }

                navigate('/admin/promotions');
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
                toast.error(errorMessage);
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Handle multi-select change
    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, fieldName: string) => {
        const options = e.target.options;
        const selectedValues: string[] = [];

        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }

        formik.setFieldValue(fieldName, selectedValues);
    };

    // Update form values when promotion data is loaded
    useEffect(() => {
        if (promotion) {
            formik.setValues({
                name: promotion.name,
                description: promotion.description,
                type: promotion.type,
                value: promotion.value,
                minPurchase: promotion.minPurchase || 0,
                maxDiscount: promotion.maxDiscount || 0,
                startDate: new Date(promotion.startDate).toISOString().split('T')[0],
                endDate: new Date(promotion.endDate).toISOString().split('T')[0],
                couponCode: promotion.couponCode,
                usageLimit: promotion.usageLimit,
                applicableMovies: promotion.applicableMovies || ['all'],
                applicableCinemas: promotion.applicableCinemas || ['all'],
                applicableDaysOfWeek: promotion.applicableDaysOfWeek || ['all'],
                status: promotion.status,
            });
        }
    }, [promotion]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isEditing && error) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
                <Button variant="primary" onClick={() => navigate('/admin/promotions')}>
                    Quay lại danh sách khuyến mãi
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditing ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
                </h1>
                <p className="text-gray-600">
                    {isEditing
                        ? `Đang chỉnh sửa: ${promotion?.name}`
                        : 'Điền thông tin chi tiết để thêm khuyến mãi mới vào hệ thống'}
                </p>
            </div>

            <form onSubmit={formik.handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thông tin cơ bản */}
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
                    </div>

                    {/* Tên khuyến mãi */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Tên khuyến mãi <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            className={`w-full rounded-md border ${
                                formik.touched.name && formik.errors.name
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập tên khuyến mãi"
                            {...formik.getFieldProps('name')}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
                        )}
                    </div>

                    {/* Mã khuyến mãi */}
                    <div>
                        <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-1">
                            Mã khuyến mãi <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="couponCode"
                            className={`w-full rounded-md border ${
                                formik.touched.couponCode && formik.errors.couponCode
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2 uppercase`}
                            placeholder="Ví dụ: SUMMER2025"
                            {...formik.getFieldProps('couponCode')}
                        />
                        <p className="mt-1 text-xs text-gray-500">Chỉ sử dụng chữ cái in hoa, số và ký tự _ -</p>
                        {formik.touched.couponCode && formik.errors.couponCode && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.couponCode}</p>
                        )}
                    </div>

                    {/* Mô tả */}
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            className={`w-full rounded-md border ${
                                formik.touched.description && formik.errors.description
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập mô tả chi tiết về khuyến mãi"
                            {...formik.getFieldProps('description')}
                        ></textarea>
                        {formik.touched.description && formik.errors.description && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
                        )}
                    </div>

                    {/* Thông tin khuyến mãi */}
                    <div className="md:col-span-2 border-t pt-6 mt-4">
                        <h2 className="text-xl font-semibold mb-4">Thông tin khuyến mãi</h2>
                    </div>

                    {/* Loại khuyến mãi */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                            Loại khuyến mãi <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="type"
                            className={`w-full rounded-md border ${
                                formik.touched.type && formik.errors.type
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            {...formik.getFieldProps('type')}
                        >
                            <option value="percentage">Phần trăm (%)</option>
                            <option value="fixed_amount">Số tiền cố định</option>
                            <option value="buy_one_get_one">Mua 1 tặng 1</option>
                        </select>
                        {formik.touched.type && formik.errors.type && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.type}</p>
                        )}
                    </div>

                    {/* Giá trị khuyến mãi */}
                    {formik.values.type !== 'buy_one_get_one' && (
                        <div>
                            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                                Giá trị khuyến mãi <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="value"
                                    className={`w-full rounded-md border ${
                                        formik.touched.value && formik.errors.value
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-primary focus:border-primary'
                                    } p-2 focus:outline-none focus:ring-2`}
                                    placeholder={formik.values.type === 'percentage' ? "Ví dụ: 10" : "Ví dụ: 50000"}
                                    {...formik.getFieldProps('value')}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    {formik.values.type === 'percentage' ? '%' : 'đ'}
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                {formik.values.type === 'percentage'
                                    ? 'Nhập phần trăm giảm giá (ví dụ: 10 cho 10%)'
                                    : 'Nhập số tiền giảm giá (ví dụ: 50000 cho 50.000đ)'}
                            </p>
                            {formik.touched.value && formik.errors.value && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.value}</p>
                            )}
                        </div>
                    )}

                    {/* Giá trị mua tối thiểu */}
                    <div>
                        <label htmlFor="minPurchase" className="block text-sm font-medium text-gray-700 mb-1">
                            Giá trị mua tối thiểu
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="minPurchase"
                                className={`w-full rounded-md border ${
                                    formik.touched.minPurchase && formik.errors.minPurchase
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-primary focus:border-primary'
                                } p-2 focus:outline-none focus:ring-2`}
                                placeholder="Ví dụ: 100000"
                                {...formik.getFieldProps('minPurchase')}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                đ
                            </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Để 0 nếu không có giá trị mua tối thiểu
                        </p>
                        {formik.touched.minPurchase && formik.errors.minPurchase && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.minPurchase}</p>
                        )}
                    </div>

                    {/* Giá trị giảm tối đa (cho khuyến mãi theo %) */}
                    {formik.values.type === 'percentage' && (
                        <div>
                            <label htmlFor="maxDiscount" className="block text-sm font-medium text-gray-700 mb-1">
                                Giá trị giảm tối đa
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="maxDiscount"
                                    className={`w-full rounded-md border ${
                                        formik.touched.maxDiscount && formik.errors.maxDiscount
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-primary focus:border-primary'
                                    } p-2 focus:outline-none focus:ring-2`}
                                    placeholder="Ví dụ: 100000"
                                    {...formik.getFieldProps('maxDiscount')}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    đ
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Để 0 nếu không có giá trị giảm tối đa
                            </p>
                            {formik.touched.maxDiscount && formik.errors.maxDiscount && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.maxDiscount}</p>
                            )}
                        </div>
                    )}

                    {/* Lượt sử dụng tối đa */}
                    <div>
                        <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 mb-1">
                            Lượt sử dụng tối đa <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="usageLimit"
                            min="1"
                            className={`w-full rounded-md border ${
                                formik.touched.usageLimit && formik.errors.usageLimit
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Ví dụ: 100"
                            {...formik.getFieldProps('usageLimit')}
                        />
                        {formik.touched.usageLimit && formik.errors.usageLimit && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.usageLimit}</p>
                        )}
                    </div>

                    {/* Thời gian hiệu lực */}
                    <div className="md:col-span-2 border-t pt-6 mt-4">
                        <h2 className="text-xl font-semibold mb-4">Thời gian hiệu lực</h2>
                    </div>

                    {/* Ngày bắt đầu */}
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            className={`w-full rounded-md border ${
                                formik.touched.startDate && formik.errors.startDate
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            {...formik.getFieldProps('startDate')}
                        />
                        {formik.touched.startDate && formik.errors.startDate && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.startDate}</p>
                        )}
                    </div>

                    {/* Ngày kết thúc */}
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày kết thúc <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            className={`w-full rounded-md border ${
                                formik.touched.endDate && formik.errors.endDate
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            {...formik.getFieldProps('endDate')}
                            min={formik.values.startDate}
                        />
                        {formik.touched.endDate && formik.errors.endDate && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.endDate}</p>
                        )}
                    </div>

                    {/* Trạng thái */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="status"
                            className={`w-full rounded-md border ${
                                formik.touched.status && formik.errors.status
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            {...formik.getFieldProps('status')}
                        >
                            <option value="upcoming">Sắp diễn ra</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="expired">Đã hết hạn</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Trạng thái sẽ tự động cập nhật dựa theo ngày bắt đầu và kết thúc
                        </p>
                        {formik.touched.status && formik.errors.status && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.status}</p>
                        )}
                    </div>

                    {/* Điều kiện áp dụng */}
                    <div className="md:col-span-2 border-t pt-6 mt-4">
                        <h2 className="text-xl font-semibold mb-4">Điều kiện áp dụng</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Mặc định sẽ áp dụng cho tất cả. Nếu muốn giới hạn, hãy chọn các mục cụ thể.
                        </p>
                    </div>

                    {/* Phim áp dụng */}
                    <div>
                        <label htmlFor="applicableMovies" className="block text-sm font-medium text-gray-700 mb-1">
                            Phim áp dụng
                        </label>
                        {dataLoading ? (
                            <div className="p-2 flex justify-center">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : (
                            <select
                                id="applicableMovies"
                                name="applicableMovies"
                                multiple
                                size={5}
                                className={`w-full rounded-md border ${
                                    formik.touched.applicableMovies && formik.errors.applicableMovies
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-primary focus:border-primary'
                                } p-2 focus:outline-none focus:ring-2`}
                                value={formik.values.applicableMovies}
                                onChange={(e) => handleMultiSelectChange(e, 'applicableMovies')}
                                onBlur={formik.handleBlur}
                            >
                                <option value="all">Tất cả phim</option>
                                {movies.map((movie) => (
                                    <option key={movie._id} value={movie._id}>
                                        {movie.title}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Giữ Ctrl (hoặc Cmd trên Mac) để chọn nhiều phim
                        </p>
                        {formik.touched.applicableMovies && formik.errors.applicableMovies && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.applicableMovies}</p>
                        )}
                    </div>

                    {/* Rạp áp dụng */}
                    <div>
                        <label htmlFor="applicableCinemas" className="block text-sm font-medium text-gray-700 mb-1">
                            Rạp áp dụng
                        </label>
                        {dataLoading ? (
                            <div className="p-2 flex justify-center">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : (
                            <select
                                id="applicableCinemas"
                                name="applicableCinemas"
                                multiple
                                size={5}
                                className={`w-full rounded-md border ${
                                    formik.touched.applicableCinemas && formik.errors.applicableCinemas
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-primary focus:border-primary'
                                } p-2 focus:outline-none focus:ring-2`}
                                value={formik.values.applicableCinemas}
                                onChange={(e) => handleMultiSelectChange(e, 'applicableCinemas')}
                                onBlur={formik.handleBlur}
                            >
                                <option value="all">Tất cả rạp</option>
                                {cinemas.map((cinema) => (
                                    <option key={cinema._id} value={cinema._id}>
                                        {cinema.name} - {cinema.location.city}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Giữ Ctrl (hoặc Cmd trên Mac) để chọn nhiều rạp
                        </p>
                        {formik.touched.applicableCinemas && formik.errors.applicableCinemas && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.applicableCinemas}</p>
                        )}
                    </div>

                    {/* Ngày trong tuần áp dụng */}
                    <div>
                        <label htmlFor="applicableDaysOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày trong tuần áp dụng
                        </label>
                        <select
                            id="applicableDaysOfWeek"
                            name="applicableDaysOfWeek"
                            multiple
                            size={5}
                            className={`w-full rounded-md border ${
                                formik.touched.applicableDaysOfWeek && formik.errors.applicableDaysOfWeek
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            value={formik.values.applicableDaysOfWeek}
                            onChange={(e) => handleMultiSelectChange(e, 'applicableDaysOfWeek')}
                            onBlur={formik.handleBlur}
                        >
                            <option value="all">Tất cả các ngày</option>
                            {daysOfWeek.map((day) => (
                                <option key={day.value} value={day.value}>
                                    {day.label}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Giữ Ctrl (hoặc Cmd trên Mac) để chọn nhiều ngày
                        </p>
                        {formik.touched.applicableDaysOfWeek && formik.errors.applicableDaysOfWeek && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.applicableDaysOfWeek}</p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 mt-8">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate('/admin/promotions')}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={submitting}
                        disabled={submitting || !formik.isValid}
                    >
                        {isEditing ? 'Cập nhật' : 'Thêm khuyến mãi'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PromotionForm;