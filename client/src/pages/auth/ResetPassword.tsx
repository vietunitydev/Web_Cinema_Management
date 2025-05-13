// src/pages/auth/ResetPassword.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import Button from '../../components/common/Button';

const ResetPassword: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Extract token from URL query params
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    // Formik setup
    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            password: Yup.string()
                .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
                .required('Mật khẩu mới là bắt buộc'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password')], 'Mật khẩu xác nhận không khớp')
                .required('Xác nhận mật khẩu là bắt buộc'),
        }),
        onSubmit: async (values) => {
            if (!token) {
                toast.error('Token không hợp lệ hoặc đã hết hạn.');
                return;
            }

            setIsSubmitting(true);
            try {
                // Use a mock request since we don't have a real endpoint
                // In a real implementation, you would call your API
                // await authService.resetPassword(token, values.password);
                setTimeout(() => {
                    setResetSuccess(true);
                    toast.success('Đặt lại mật khẩu thành công!');
                }, 1000);
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.'
                );
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    // Redirect to login if no token provided
    if (!token && !resetSuccess) {
        toast.error('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <Link to="/" className="flex justify-center">
                        <h1 className="text-primary font-bold text-3xl">CinemaHub</h1>
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Đặt lại mật khẩu
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Nhập mật khẩu mới cho tài khoản của bạn
                    </p>
                </div>

                {resetSuccess ? (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Đặt lại mật khẩu thành công!</h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>
                                        Mật khẩu của bạn đã được đặt lại thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <div className="-mx-2 -my-1.5 flex">
                                        <Link
                                            to="/login"
                                            className="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Đăng nhập ngay
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu mới
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                                        formik.touched.password && formik.errors.password
                                            ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 placeholder-gray-500 focus:ring-primary focus:border-primary'
                                    } text-gray-900 focus:outline-none focus:z-10 sm:text-sm`}
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.password && formik.errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                                        formik.touched.confirmPassword && formik.errors.confirmPassword
                                            ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 placeholder-gray-500 focus:ring-primary focus:border-primary'
                                    } text-gray-900 focus:outline-none focus:z-10 sm:text-sm`}
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="lg"
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                            >
                                Đặt lại mật khẩu
                            </Button>
                        </div>

                        <div className="text-center mt-4">
                            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;