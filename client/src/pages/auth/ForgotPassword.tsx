// src/pages/auth/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import Button from '../../components/common/Button';

const ForgotPassword: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // Formik setup
    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Email không hợp lệ')
                .required('Email là bắt buộc'),
        }),
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                // Use a mock request since we don't have a real endpoint
                // In a real implementation, you would call your API
                // await authService.forgotPassword(values.email);
                setTimeout(() => {
                    setEmailSent(true);
                    toast.success('Yêu cầu đã được gửi. Vui lòng kiểm tra email của bạn.');
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <Link to="/" className="flex justify-center">
                        <h1 className="text-primary font-bold text-3xl">CinemaHub</h1>
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Quên mật khẩu
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
                    </p>
                </div>

                {emailSent ? (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Email đã được gửi!</h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>
                                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư đến và thư rác.
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <div className="-mx-2 -my-1.5 flex">
                                        <Link
                                            to="/login"
                                            className="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Quay lại đăng nhập
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                                        formik.touched.email && formik.errors.email
                                            ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 placeholder-gray-500 focus:ring-primary focus:border-primary'
                                    } text-gray-900 focus:outline-none focus:z-10 sm:text-sm`}
                                    placeholder="Địa chỉ email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <Link
                                    to="/login"
                                    className="font-medium text-primary hover:text-primary-dark"
                                >
                                    Quay lại đăng nhập
                                </Link>
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
                                Gửi yêu cầu
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;