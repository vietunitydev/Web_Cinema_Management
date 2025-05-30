// src/components/layout/AdminLayout.tsx
import React, { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
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

    if (!user || user.role !== 'admin') {
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
                        to="/admin/dashboard"
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
                        <span>Admin Panel</span>
                    </Link>

                    <nav className="mt-5 px-2">
                        <Link
                            to="/admin/dashboard"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                location.pathname === '/admin/dashboard'
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
                            Dashboard
                        </Link>

                        <Link
                            to="/admin/movies"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md mt-1 ${
                                location.pathname.includes('/admin/movies')
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
                                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                                />
                            </svg>
                            Quản lý phim
                        </Link>

                        <Link
                            to="/admin/users"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md mt-1 ${
                                location.pathname.includes('/admin/users')
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
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                            Quản lý người dùng
                        </Link>

                        <Link
                            to="/admin/promotions"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md mt-1 ${
                                location.pathname.includes('/admin/promotions')
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
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Quản lý khuyến mãi
                        </Link>

                        <Link
                            to="/admin/reviews"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md mt-1 ${
                                location.pathname.includes('/admin/reviews')
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
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                            </svg>
                            Quản lý đánh giá
                        </Link>

                        <Link
                            to="/admin/reports"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md mt-1 ${
                                location.pathname.includes('/admin/reports')
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
                            <span className="text-white text-xl font-semibold">Admin Panel</span>
                        </div>
                        <nav className="mt-5 px-2 space-y-1">
                            <Link
                                to="/admin/dashboard"
                                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                    location.pathname === '/admin/dashboard'
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
                                Dashboard
                            </Link>

                            <Link
                                to="/admin/movies"
                                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                    location.pathname.includes('/admin/movies')
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
                                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                                    />
                                </svg>
                                Quản lý phim
                            </Link>

                            <Link
                                to="/admin/users"
                                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                    location.pathname.includes('/admin/users')
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
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                                Quản lý người dùng
                            </Link>

                            <Link
                                to="/admin/promotions"
                                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                    location.pathname.includes('/admin/promotions')
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
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Quản lý khuyến mãi
                            </Link>

                            <Link
                                to="/admin/reports"
                                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                    location.pathname.includes('/admin/reports')
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
                                Admin Dashboard
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

export default AdminLayout;