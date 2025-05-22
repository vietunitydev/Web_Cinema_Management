// src/pages/auth/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Register: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            fullName: '',
            username: '',
            email: '',
            phone: '',
            passwordHash: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            fullName: Yup.string().required('Họ tên là bắt buộc'),
            username: Yup.string()
                .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
                .max(20, 'Tên đăng nhập không được quá 20 ký tự')
                .matches(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ chấp nhận chữ cái, số và dấu gạch dưới')
                .required('Tên đăng nhập là bắt buộc'),
            email: Yup.string()
                .email('Email không hợp lệ')
                .required('Email là bắt buộc'),
            phone: Yup.string()
                .matches(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số')
                .notRequired(),
            passwordHash: Yup.string()
                .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
                .required('Mật khẩu là bắt buộc'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('passwordHash')], 'Mật khẩu xác nhận không khớp')
                .required('Xác nhận mật khẩu là bắt buộc'),
        }),
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                await register(values);
                toast.success('Đăng ký thành công!');
                navigate('/');
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
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
                        Đăng ký tài khoản
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Hoặc{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                            đăng nhập nếu đã có tài khoản
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="fullName" className="sr-only">
                                Họ tên
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                    formik.touched.fullName && formik.errors.fullName
                                        ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 placeholder-gray-500 focus:ring-primary focus:border-primary'
                                } text-gray-900 rounded-t-md focus:outline-none focus:z-10 sm:text-sm`}
                                placeholder="Họ tên"
                                value={formik.values.fullName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.fullName && formik.errors.fullName && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.fullName}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Tên đăng nhập
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                    formik.touched.username && formik.errors.username
                                        ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 placeholder-gray-500 focus:ring-primary focus:border-primary'
                                } text-gray-900 focus:outline-none focus:z-10 sm:text-sm`}
                                placeholder="Tên đăng nhập"
                                value={formik.values.username}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.username && formik.errors.username && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.username}</p>
                            )}
                        </div>
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
                        <div>
                            <label htmlFor="phone" className="sr-only">
                                Số điện thoại
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                    formik.touched.phone && formik.errors.phone
                                        ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 placeholder-gray-500 focus:ring-primary focus:border-primary'
                                } text-gray-900 focus:outline-none focus:z-10 sm:text-sm`}
                                placeholder="Số điện thoại (không bắt buộc)"
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.phone && formik.errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="passwordHash" className="sr-only">
                                Mật khẩu
                            </label>
                            <input
                                id="passwordHash"
                                name="passwordHash"
                                type="password"
                                autoComplete="new-password"
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                    formik.touched.passwordHash && formik.errors.passwordHash
                                        ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 placeholder-gray-500 focus:ring-primary focus:border-primary'
                                } text-gray-900 focus:outline-none focus:z-10 sm:text-sm`}
                                placeholder="Mật khẩu"
                                value={formik.values.passwordHash}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.passwordHash && formik.errors.passwordHash && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.passwordHash}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                    formik.touched.confirmPassword && formik.errors.confirmPassword
                                        ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 placeholder-gray-500 focus:ring-primary focus:border-primary'
                                } text-gray-900 rounded-b-md focus:outline-none focus:z-10 sm:text-sm`}
                                placeholder="Xác nhận mật khẩu"
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
                                'Đăng ký'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;