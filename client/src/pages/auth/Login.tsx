// src/pages/auth/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    // Get the redirect path from location state or default to home
    const from = (location.state as any)?.from?.pathname || '/';

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Email không hợp lệ')
                .required('Email là bắt buộc'),
            password: Yup.string()
                .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
                .required('Mật khẩu là bắt buộc'),
        }),
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                await login(values.email, values.password);
                toast.success('Đăng nhập thành công!');
                navigate(from, { replace: true });
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.'
                );
            } finally {
                setIsLoading(false);
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
                        Đăng nhập tài khoản
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Hoặc{' '}
                        <Link
                            to="/register"
                            className="font-medium text-primary hover:text-primary-dark"
                        >
                            đăng ký tài khoản mới
                        </Link>
                    </p>
                </div>
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
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                    formik.touched.email && formik.errors.email
                                        ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 placeholder-gray-500 focus:ring-primary focus:border-primary'
                                } text-gray-900 rounded-t-md focus:outline-none focus:z-10 sm:text-sm`}
                                placeholder="Địa chỉ email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                    formik.touched.password && formik.errors.password
                                        ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 placeholder-gray-500 focus:ring-primary focus:border-primary'
                                } text-gray-900 rounded-b-md focus:outline-none focus:z-10 sm:text-sm`}
                                placeholder="Mật khẩu"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Nhớ đăng nhập
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link
                                to="/forgot-password"
                                className="font-medium text-primary hover:text-primary-dark"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            {isLoading ? (
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;