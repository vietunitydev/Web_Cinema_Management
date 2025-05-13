// src/pages/admin/UserForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { userService } from '../../services/userService';
import type { User } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

interface UserFormValues {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    role: 'admin' | 'manager' | 'customer';
}

const UserForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch user details if editing
    useEffect(() => {
        const fetchUser = async () => {
            if (!isEditing) return;

            try {
                const response = await userService.getUserById(id);
                if (response.data) {
                    setUser(response.data);
                } else {
                    setError('Không tìm thấy thông tin người dùng');
                }
            } catch (err) {
                setError('Lỗi khi tải thông tin người dùng');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, isEditing]);

    // Set up formik with validation
    const formik = useFormik<UserFormValues>({
        initialValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            phone: '',
            address: '',
            dateOfBirth: '',
            role: 'customer',
        },
        validationSchema: Yup.object({
            username: Yup.string()
                .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
                .max(30, 'Tên đăng nhập không được vượt quá 30 ký tự')
                .matches(/^[a-zA-Z0-9._-]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và ký tự đặc biệt . _ -')
                .required('Tên đăng nhập là bắt buộc'),
            email: Yup.string()
                .email('Email không hợp lệ')
                .required('Email là bắt buộc'),
            password: Yup.string()
                .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
                .when('$isEditing', {
                    is: false,
                    then: (schema) => schema.required('Mật khẩu là bắt buộc'),
                    otherwise: (schema) => schema,
                }),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password')], 'Mật khẩu xác nhận không khớp')
                .when('password', {
                    is: (val: string) => val && val.length > 0,
                    then: (schema) => schema.required('Xác nhận mật khẩu là bắt buộc'),
                }),
            fullName: Yup.string()
                .required('Họ tên là bắt buộc'),
            phone: Yup.string()
                .matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
                .nullable(),
            dateOfBirth: Yup.date()
                .max(new Date(), 'Ngày sinh không thể là ngày trong tương lai')
                .nullable(),
            role: Yup.string()
                .oneOf(['admin', 'manager', 'customer'], 'Vai trò không hợp lệ')
                .required('Vai trò là bắt buộc'),
        }, [['$isEditing', isEditing]]),
        onSubmit: async (values) => {
            setSubmitting(true);

            try {
                // For editing, only include fields that are filled
                const userData: Partial<UserFormValues> = { ...values };

                // Remove password fields if empty
                if (isEditing && !values.password) {
                    delete userData.password;
                    delete userData.confirmPassword;
                }

                // Always remove confirmPassword as it's not needed for API
                delete userData.confirmPassword;

                if (isEditing) {
                    await userService.updateUser(id, userData);
                    toast.success('Cập nhật người dùng thành công');
                } else {
                    await userService.createUser(userData as any); // Type cast needed here
                    toast.success('Thêm người dùng mới thành công');
                }

                navigate('/admin/users');
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
                toast.error(errorMessage);
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Update form values when user data is loaded
    useEffect(() => {
        if (user) {
            formik.setValues({
                username: user.username,
                email: user.email,
                password: '',
                confirmPassword: '',
                fullName: user.fullName,
                phone: user.phone || '',
                address: user.address || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                role: user.role,
            });
        }
    }, [user]);

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
                <Button variant="primary" onClick={() => navigate('/admin/users')}>
                    Quay lại danh sách người dùng
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                </h1>
                <p className="text-gray-600">
                    {isEditing
                        ? `Đang chỉnh sửa: ${user?.fullName}`
                        : 'Điền thông tin chi tiết để thêm người dùng mới vào hệ thống'}
                </p>
            </div>

            <form onSubmit={formik.handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thông tin đăng nhập */}
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Thông tin đăng nhập</h2>
                    </div>

                    {/* Tên đăng nhập */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Tên đăng nhập <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className={`w-full rounded-md border ${
                                formik.touched.username && formik.errors.username
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập tên đăng nhập"
                            {...formik.getFieldProps('username')}
                            disabled={isEditing} // Cannot change username when editing
                        />
                        {formik.touched.username && formik.errors.username && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={`w-full rounded-md border ${
                                formik.touched.email && formik.errors.email
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập địa chỉ email"
                            {...formik.getFieldProps('email')}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                        )}
                    </div>

                    {/* Mật khẩu */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu {!isEditing && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={`w-full rounded-md border ${
                                formik.touched.password && formik.errors.password
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder={isEditing ? "Để trống nếu không muốn đổi mật khẩu" : "Nhập mật khẩu"}
                            {...formik.getFieldProps('password')}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
                        )}
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Xác nhận mật khẩu {!isEditing && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className={`w-full rounded-md border ${
                                formik.touched.confirmPassword && formik.errors.confirmPassword
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập lại mật khẩu"
                            {...formik.getFieldProps('confirmPassword')}
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Thông tin cá nhân */}
                    <div className="md:col-span-2 border-t pt-6 mt-4">
                        <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
                    </div>

                    {/* Họ tên */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                            Họ tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            className={`w-full rounded-md border ${
                                formik.touched.fullName && formik.errors.fullName
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập họ tên đầy đủ"
                            {...formik.getFieldProps('fullName')}
                        />
                        {formik.touched.fullName && formik.errors.fullName && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.fullName}</p>
                        )}
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className={`w-full rounded-md border ${
                                formik.touched.phone && formik.errors.phone
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập số điện thoại"
                            {...formik.getFieldProps('phone')}
                        />
                        {formik.touched.phone && formik.errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
                        )}
                    </div>

                    {/* Ngày sinh */}
                    <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            className={`w-full rounded-md border ${
                                formik.touched.dateOfBirth && formik.errors.dateOfBirth
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            {...formik.getFieldProps('dateOfBirth')}
                            max={new Date().toISOString().split('T')[0]}
                        />
                        {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.dateOfBirth}</p>
                        )}
                    </div>

                    {/* Địa chỉ */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            className={`w-full rounded-md border ${
                                formik.touched.address && formik.errors.address
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập địa chỉ"
                            {...formik.getFieldProps('address')}
                        />
                        {formik.touched.address && formik.errors.address && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.address}</p>
                        )}
                    </div>

                    {/* Vai trò */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Vai trò <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="role"
                            name="role"
                            className={`w-full rounded-md border ${
                                formik.touched.role && formik.errors.role
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            {...formik.getFieldProps('role')}
                        >
                            <option value="customer">Khách hàng</option>
                            <option value="manager">Quản lý rạp</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                        {formik.touched.role && formik.errors.role && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.role}</p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 mt-8">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate('/admin/users')}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={submitting}
                        disabled={submitting || !formik.isValid}
                    >
                        {isEditing ? 'Cập nhật' : 'Thêm người dùng'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;