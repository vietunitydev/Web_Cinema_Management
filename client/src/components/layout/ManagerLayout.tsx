// src/components/layout/ManagerLayout.tsx
import React, { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {useAuth} from "../../context/AuthContext.tsx";

interface ManagerLayoutProps {
    children: ReactNode;
}

const ManagerLayout: React.FC<ManagerLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    if (!user || user.role !== 'manager') {
        return <div className="p-8 text-center">Bạn không có quyền truy cập trang này.</div>;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar for desktop */}
            <aside
                className={`fixed inset-y-0 z-50 flex-shrink-0 w-64 mt-16 overflow-y-auto bg-secondary md:block hidden`}
            >
                <div className="py-4 text-gray-100">
                    <Link
                        to="/manager/dashboard"
                        className="block py-2.5 px-4 flex items-center space-x-2 text-xl font-semibold"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h7"
                            />
                        </svg>
                        <span>Quản lý rạp</span>
                    </Link>

                    <nav className="mt-5 px-2">
                        <Link
                            to="/manager/dashboard"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                location.pathname === '/manager/dashboard'
                                    ? 'bg-secondary-dark text-white'
                                    : 'text-gray-300 hover:bg-secondary-dark hover:text-white'
                            }`}
                        >
                            <svg
                                className="mr-3 h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            Tổng quan
                        </Link>

                        <Link
                            to="/manager/showtimes"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md mt-1 ${
                                location.pathname.includes('/manager/showtimes')
                                    ? 'bg-secondary-dark text-white'
                                    : 'text-gray-300 hover:bg-secondary-dark hover:text-white'
                            }`}
                        >
                            <svg
                                className="mr-3 h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            Quản lý lịch chiếu
                        </Link>

                        <Link
                            to="/manager/cinemas"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md mt-1 ${
                                location.pathname.includes('/manager/cinemas')
                                    ? 'bg-secondary-dark text-white'
                                    : 'text-gray-300 hover:bg-secondary-dark hover:text-white'
                            }`}
                        >
                            <svg
                                className="mr-3 h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            Quản lý Rạp chiếu
                        </Link>

                        <Link
                            to="/manager/halls"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md mt-1 ${
                                location.pathname.includes('/manager/halls')
                                    ? 'bg-secondary-dark text-white'
                                    : 'text-gray-300 hover:bg-secondary-dark hover:text-white'
                            }`}
                        >
                            <svg
                                className="mr-3 h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                            Quản lý phòng chiếu
                        </Link>

                        <Link
                            to="/manager/reports"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md mt-1 ${
                                location.pathname.includes('/manager/reports')
                                    ? 'bg-secondary-dark text-white'
                                    : 'text-gray-300 hover:bg-secondary-dark hover:text-white'
                            }`}
                        >
                            <svg
                                className="mr-3 h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            Báo cáo & thống kê
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Mobile sidebar */}
            <div
                className={`fixed inset-0 z-40 flex md:hidden ${
                    isSidebarOpen ? 'visible' : 'invisible'
                }`}
            >
                <div
                    className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
                        isSidebarOpen ? 'opacity-100 ease-out duration-300' : 'opacity-0 ease-in duration-200'
                    }`}
                    onClick={toggleSidebar}
                ></div>

                <div
                    className={`relative flex-1 flex flex-col max-w-xs w-full bg-secondary transition ease-in-out duration-300 transform ${
                        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={toggleSidebar}
                        >
                            <span className="sr-only">Close sidebar</span>
                            <svg
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                        <div className="flex-shrink-0 flex items-center px-4">
                            <span className="text-white text-xl font-semibold">Quản lý rạp</span>
                        </div>
                        <nav className="mt-5 px-2 space-y-1">
                            <Link
                                to="/manager/dashboard"
                                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                    location.pathname === '/manager/dashboard'
                                        ? 'bg-secondary-dark text-white'
                                        : 'text-gray-300 hover:bg-secondary-dark hover:text-white'
                                }`}
                            >
                                <svg
                                    className="mr-3 h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                Tổng quan
                            </Link>

                            <Link
                                to="/manager/showtimes"
                                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                    location.pathname.includes('/manager/showtimes')
                                        ? 'bg-secondary-dark text-white'
                                        : 'text-gray-300 hover:bg-secondary-dark hover:text-white'
                                }`}
                            >
                                <svg
                                    className="mr-3 h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                Quản lý lịch chiếu
                            </Link>

                            <Link
                                to="/manager/halls"
                                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                    location.pathname.includes('/manager/halls')
                                        ? 'bg-secondary-dark text-white'
                                        : 'text-gray-300 hover:bg-secondary-dark hover:text-white'
                                }`}
                            >
                                <svg
                                    className="mr-3 h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                </svg>
                                Quản lý phòng chiếu
                            </Link>

                            <Link
                                to="/manager/reports"
                                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                    location.pathname.includes('/manager/reports')
                                        ? 'bg-secondary-dark text-white'
                                        : 'text-gray-300 hover:bg-secondary-dark hover:text-white'
                                }`}
                            >
                                <svg
                                    className="mr-3 h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                                Báo cáo & thống kê
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64 flex flex-col flex-1">
                <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
                    <button
                        type="button"
                        className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
                        onClick={toggleSidebar}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>

                    <div className="flex-1 px-4 flex justify-between">
                        <div className="flex-1 flex items-center">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Quản lý rạp chiếu phim
                            </h1>
                        </div>
                        <div className="ml-4 flex items-center md:ml-6">
                            <div className="relative">
                                <button
                                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    onClick={handleLogout}
                                >
                                    <span className="mr-2">Đăng xuất</span>
                                    <svg
                                        className="h-6 w-6 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ManagerLayout;