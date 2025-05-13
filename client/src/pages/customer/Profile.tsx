// src/pages/customer/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
// import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const Profile: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Password change form
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const profileFormik = useFormik({
        initialValues: {
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            address: user?.address || '',
            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        },
        validationSchema: Yup.object({
            fullName: Yup.string().required('Họ tên là bắt buộc'),
            phone: Yup.string()
                .matches(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số')
                .notRequired(),
            address: Yup.string().notRequired(),
            dateOfBirth: Yup.date().notRequired().max(new Date(), 'Ngày sinh không thể là ngày trong tương lai'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                await updateProfile(values);
                toast.success('Cập nhật thông tin thành công!');
                setIsEditMode(false);
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Cập nhật thông tin thất bại');
            } finally {
                setLoading(false);
            }
        },
    });

    const passwordFormik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            currentPassword: Yup.string().required('Mật khẩu hiện tại là bắt buộc'),
            newPassword: Yup.string()
                .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
                .required('Mật khẩu mới là bắt buộc'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
                .required('Xác nhận mật khẩu là bắt buộc'),
        }),
        onSubmit: async (values) => {
            setPasswordLoading(true);
            try {
                await authService.updatePassword(values.currentPassword, values.newPassword);
                toast.success('Cập nhật mật khẩu thành công!');
                setShowPasswordForm(false);
                passwordFormik.resetForm();
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Cập nhật mật khẩu thất bại');
            } finally {
                setPasswordLoading(false);
            }
        },
    });

    // Reset form when user data changes
    useEffect(() => {
        if (user) {
            profileFormik.setValues({
                fullName: user.fullName || '',
                phone: user.phone || '',
                address: user.address || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            });
        }
    }, [user]);

    if (!user) {
        navigate('/login', { state: { from: window.location.pathname } });
        return null;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Thông tin tài khoản</h1>

                    {/* Profile Information Card */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
                                {!isEditMode ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditMode(true)}
                                        icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                />
                                            </svg>
                                        }
                                    >
                                        Chỉnh sửa
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setIsEditMode(false);
                                            profileFormik.resetForm();
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                )}
                            </div>

                            {isEditMode ? (
                                <form onSubmit={profileFormik.handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                                Họ tên <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="fullName"
                                                name="fullName"
                                                type="text"
                                                className={`w-full px-3 py-2 border ${
                                                    profileFormik.touched.fullName && profileFormik.errors.fullName
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-primary focus:border-primary'
                                                } rounded-md shadow-sm focus:outline-none focus:ring-1`}
                                                value={profileFormik.values.fullName}
                                                onChange={profileFormik.handleChange}
                                                onBlur={profileFormik.handleBlur}
                                            />
                                            {profileFormik.touched.fullName && profileFormik.errors.fullName && (
                                                <p className="mt-1 text-sm text-red-600">{profileFormik.errors.fullName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={user.email}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                                                disabled
                                            />
                                            <p className="mt-1 text-sm text-gray-500">Email không thể thay đổi</p>
                                        </div>

                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                                Số điện thoại
                                            </label>
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="text"
                                                className={`w-full px-3 py-2 border ${
                                                    profileFormik.touched.phone && profileFormik.errors.phone
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-primary focus:border-primary'
                                                } rounded-md shadow-sm focus:outline-none focus:ring-1`}
                                                value={profileFormik.values.phone}
                                                onChange={profileFormik.handleChange}
                                                onBlur={profileFormik.handleBlur}
                                            />
                                            {profileFormik.touched.phone && profileFormik.errors.phone && (
                                                <p className="mt-1 text-sm text-red-600">{profileFormik.errors.phone}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                                                Ngày sinh
                                            </label>
                                            <input
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                type="date"
                                                className={`w-full px-3 py-2 border ${
                                                    profileFormik.touched.dateOfBirth && profileFormik.errors.dateOfBirth
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-primary focus:border-primary'
                                                } rounded-md shadow-sm focus:outline-none focus:ring-1`}
                                                value={profileFormik.values.dateOfBirth}
                                                onChange={profileFormik.handleChange}
                                                onBlur={profileFormik.handleBlur}
                                                max={new Date().toISOString().split('T')[0]}
                                            />
                                            {profileFormik.touched.dateOfBirth && profileFormik.errors.dateOfBirth && (
                                                <p className="mt-1 text-sm text-red-600">{profileFormik.errors.dateOfBirth}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                                Địa chỉ
                                            </label>
                                            <input
                                                id="address"
                                                name="address"
                                                type="text"
                                                className={`w-full px-3 py-2 border ${
                                                    profileFormik.touched.address && profileFormik.errors.address
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-primary focus:border-primary'
                                                } rounded-md shadow-sm focus:outline-none focus:ring-1`}
                                                value={profileFormik.values.address}
                                                onChange={profileFormik.handleChange}
                                                onBlur={profileFormik.handleBlur}
                                            />
                                            {profileFormik.touched.address && profileFormik.errors.address && (
                                                <p className="mt-1 text-sm text-red-600">{profileFormik.errors.address}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                isLoading={loading}
                                                disabled={!profileFormik.dirty || !profileFormik.isValid || loading}
                                            >
                                                Lưu thay đổi
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Họ tên</h3>
                                            <p className="mt-1">{user.fullName}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                            <p className="mt-1">{user.email}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Số điện thoại</h3>
                                            <p className="mt-1">{user.phone || '—'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Ngày sinh</h3>
                                            <p className="mt-1">
                                                {user.dateOfBirth
                                                    ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN')
                                                    : '—'}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <h3 className="text-sm font-medium text-gray-500">Địa chỉ</h3>
                                            <p className="mt-1">{user.address || '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Security Card */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Bảo mật tài khoản</h2>
                                {!showPasswordForm ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowPasswordForm(true)}
                                        icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                                />
                                            </svg>
                                        }
                                    >
                                        Đổi mật khẩu
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            passwordFormik.resetForm();
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                )}
                            </div>

                            {showPasswordForm ? (
                                <form onSubmit={passwordFormik.handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                                Mật khẩu hiện tại <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type="password"
                                                className={`w-full px-3 py-2 border ${
                                                    passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-primary focus:border-primary'
                                                } rounded-md shadow-sm focus:outline-none focus:ring-1`}
                                                value={passwordFormik.values.currentPassword}
                                                onChange={passwordFormik.handleChange}
                                                onBlur={passwordFormik.handleBlur}
                                            />
                                            {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
                                                <p className="mt-1 text-sm text-red-600">{passwordFormik.errors.currentPassword}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                                Mật khẩu mới <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                className={`w-full px-3 py-2 border ${
                                                    passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-primary focus:border-primary'
                                                } rounded-md shadow-sm focus:outline-none focus:ring-1`}
                                                value={passwordFormik.values.newPassword}
                                                onChange={passwordFormik.handleChange}
                                                onBlur={passwordFormik.handleBlur}
                                            />
                                            {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                                                <p className="mt-1 text-sm text-red-600">{passwordFormik.errors.newPassword}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                className={`w-full px-3 py-2 border ${
                                                    passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-primary focus:border-primary'
                                                } rounded-md shadow-sm focus:outline-none focus:ring-1`}
                                                value={passwordFormik.values.confirmPassword}
                                                onChange={passwordFormik.handleChange}
                                                onBlur={passwordFormik.handleBlur}
                                            />
                                            {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                                                <p className="mt-1 text-sm text-red-600">{passwordFormik.errors.confirmPassword}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                isLoading={passwordLoading}
                                                disabled={!passwordFormik.isValid || passwordLoading}
                                            >
                                                Cập nhật mật khẩu
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <p className="text-gray-600">
                                        Bạn có thể thay đổi mật khẩu tài khoản để đảm bảo tính bảo mật.
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Mật khẩu nên có ít nhất 6 ký tự và bao gồm chữ cái, số và ký tự đặc biệt.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Info Card */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Thông tin tài khoản</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tên tài khoản:</span>
                                    <span className="font-medium">{user.username}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngày đăng ký:</span>
                                    <span>
                    {new Date(user.registrationDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Vai trò:</span>
                                    <span className="capitalize">
                    {user.role === 'customer' ? 'Khách hàng' : user.role === 'manager' ? 'Quản lý rạp' : 'Quản trị viên'}
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row justify-between">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/bookings')}
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                    />
                                </svg>
                            }
                        >
                            Xem lịch sử đặt vé
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/')}
                            className="mt-3 sm:mt-0"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                            }
                        >
                            Quay lại trang chủ
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;