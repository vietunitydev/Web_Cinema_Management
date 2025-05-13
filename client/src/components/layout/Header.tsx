// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Đăng xuất thất bại', error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    return (
        <header className="bg-secondary text-white shadow-md">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <span className="text-primary font-bold text-2xl">CinemaHub</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="hover:text-primary transition-colors">
                            Trang chủ
                        </Link>
                        <Link to="/movies" className="hover:text-primary transition-colors">
                            Phim
                        </Link>
                        <Link to="/cinemas" className="hover:text-primary transition-colors">
                            Rạp
                        </Link>
                        <Link to="/promotions" className="hover:text-primary transition-colors">
                            Khuyến mãi
                        </Link>
                    </nav>

                    {/* User Menu or Login/Register */}
                    <div className="hidden md:block">
                        {user ? (
                            <div className="relative">
                                <button
                                    className="flex items-center text-white focus:outline-none"
                                    onClick={toggleProfile}
                                >
                                    <span className="mr-2">{user.fullName}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                        {user.role === 'admin' && (
                                            <Link
                                                to="/admin/dashboard"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Quản trị hệ thống
                                            </Link>
                                        )}
                                        {user.role === 'manager' && (
                                            <Link
                                                to="/manager/dashboard"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Quản lý rạp
                                            </Link>
                                        )}
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Tài khoản của tôi
                                        </Link>
                                        <Link
                                            to="/bookings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Lịch sử đặt vé
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/login" className="hover:text-primary transition-colors">
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            className="text-white focus:outline-none"
                            onClick={toggleMenu}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pb-2">
                        <nav className="flex flex-col space-y-3">
                            <Link to="/" className="hover:text-primary transition-colors">
                                Trang chủ
                            </Link>
                            <Link to="/movies" className="hover:text-primary transition-colors">
                                Phim
                            </Link>
                            <Link to="/cinemas" className="hover:text-primary transition-colors">
                                Rạp
                            </Link>
                            <Link to="/promotions" className="hover:text-primary transition-colors">
                                Khuyến mãi
                            </Link>
                        </nav>
                        {user ? (
                            <div className="mt-4 pt-3 border-t border-gray-700">
                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="block py-2 hover:text-primary transition-colors"
                                    >
                                        Quản trị hệ thống
                                    </Link>
                                )}
                                {user.role === 'manager' && (
                                    <Link
                                        to="/manager/dashboard"
                                        className="block py-2 hover:text-primary transition-colors"
                                    >
                                        Quản lý rạp
                                    </Link>
                                )}
                                <Link
                                    to="/profile"
                                    className="block py-2 hover:text-primary transition-colors"
                                >
                                    Tài khoản của tôi
                                </Link>
                                <Link
                                    to="/bookings"
                                    className="block py-2 hover:text-primary transition-colors"
                                >
                                    Lịch sử đặt vé
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left py-2 hover:text-primary transition-colors"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="mt-4 pt-3 border-t border-gray-700 flex flex-col space-y-3">
                                <Link to="/login" className="hover:text-primary transition-colors">
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors inline-block"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;