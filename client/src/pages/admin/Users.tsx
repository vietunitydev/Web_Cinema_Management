// src/pages/admin/Users.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import type { User } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const Users: React.FC = () => {
    // State
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const itemsPerPage = 10;

    // Fetch users based on filters
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await userService.getAllUsers(currentPage, itemsPerPage);

                // Update state with fetched data
                if (response.data) {
                    // Filter users based on search term and role
                    let filteredUsers = response.data.data;

                    if (searchTerm) {
                        const term = searchTerm.toLowerCase();
                        filteredUsers = filteredUsers.filter(
                            user =>
                                user.fullName.toLowerCase().includes(term) ||
                                user.email.toLowerCase().includes(term) ||
                                user.username.toLowerCase().includes(term)
                        );
                    }

                    if (roleFilter) {
                        filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
                    }

                    setUsers(filteredUsers);
                    setTotalItems(response.data.totalCount);
                    setTotalPages(response.data.totalPages);
                }
            } catch (err) {
                setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentPage, searchTerm, roleFilter]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // Handle search form submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
        setCurrentPage(1);
    };

    // Handle deactivate user
    const handleDeactivateUser = (id: string) => {
        confirmAlert({
            title: 'Xác nhận vô hiệu hóa',
            message: 'Bạn có chắc muốn vô hiệu hóa tài khoản người dùng này?',
            buttons: [
                {
                    label: 'Có',
                    onClick: async () => {
                        setActionLoading(true);
                        try {
                            await userService.deactivateUser(id);
                            // Update user in the list
                            setUsers(users.map(user => {
                                if (user._id === id) {
                                    return { ...user, isActive: false };
                                }
                                return user;
                            }));
                            toast.success('Đã vô hiệu hóa tài khoản thành công');
                        } catch (err) {
                            toast.error('Lỗi khi vô hiệu hóa tài khoản');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                },
                {
                    label: 'Không',
                    onClick: () => {}
                }
            ]
        });
    };

    // Handle activate user
    const handleActivateUser = (id: string) => {
        confirmAlert({
            title: 'Xác nhận kích hoạt',
            message: 'Bạn có chắc muốn kích hoạt lại tài khoản người dùng này?',
            buttons: [
                {
                    label: 'Có',
                    onClick: async () => {
                        setActionLoading(true);
                        try {
                            await userService.activateUser(id);
                            // Update user in the list
                            setUsers(users.map(user => {
                                if (user._id === id) {
                                    return { ...user, isActive: true };
                                }
                                return user;
                            }));
                            toast.success('Đã kích hoạt tài khoản thành công');
                        } catch (err) {
                            toast.error('Lỗi khi kích hoạt tài khoản');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                },
                {
                    label: 'Không',
                    onClick: () => {}
                }
            ]
        });
    };

    // Handle delete user
    const handleDeleteUser = (id: string) => {
        confirmAlert({
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác.',
            buttons: [
                {
                    label: 'Có',
                    onClick: async () => {
                        setActionLoading(true);
                        try {
                            await userService.deleteUser(id);
                            // Remove the user from state
                            setUsers(users.filter(user => user._id !== id));
                            toast.success('Xóa người dùng thành công');
                        } catch (err) {
                            toast.error('Lỗi khi xóa người dùng');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                },
                {
                    label: 'Không',
                    onClick: () => {}
                }
            ]
        });
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    // Translate role to Vietnamese
    const translateRole = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Quản trị viên';
            case 'manager':
                return 'Quản lý rạp';
            case 'customer':
                return 'Khách hàng';
            default:
                return role;
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý người dùng</h1>
                    <p className="text-gray-600">Quản lý thông tin người dùng trong hệ thống</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link to="/admin/users/create">
                        <Button
                            variant="primary"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            }
                        >
                            Thêm người dùng
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <form onSubmit={handleSearch}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search input */}
                        <div className="md:col-span-2">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                Tìm kiếm
                            </label>
                            <input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Tìm theo tên, email, tên đăng nhập..."
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Role filter */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                Vai trò
                            </label>
                            <select
                                id="role"
                                name="role"
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="">Tất cả vai trò</option>
                                <option value="admin">Quản trị viên</option>
                                <option value="manager">Quản lý rạp</option>
                                <option value="customer">Khách hàng</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4 space-x-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={clearFilters}
                        >
                            Xóa bộ lọc
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                        >
                            Tìm kiếm
                        </Button>
                    </div>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-red-500">{error}</div>
                ) : users.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        Không tìm thấy người dùng nào. Vui lòng thử lại với bộ lọc khác.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Người dùng
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Email
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Vai trò
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Ngày đăng ký
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Trạng thái
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Hành động
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    {user.fullName.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                                <div className="text-sm text-gray-500">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                        {user.phone && (
                                            <div className="text-sm text-gray-500">{user.phone}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.role === 'admin'
                                                    ? 'bg-red-100 text-red-800'
                                                    : user.role === 'manager'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-green-100 text-green-800'
                                            }`}>
                                                {translateRole(user.role)}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatDate(user.registrationDate)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.isActive === false
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {user.isActive === false ? 'Vô hiệu hóa' : 'Hoạt động'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/admin/users/${user._id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Sửa
                                            </Link>

                                            {user.isActive === false ? (
                                                <button
                                                    className="text-green-600 hover:text-green-900"
                                                    onClick={() => handleActivateUser(user._id)}
                                                    disabled={actionLoading}
                                                >
                                                    Kích hoạt
                                                </button>
                                            ) : (
                                                <button
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    onClick={() => handleDeactivateUser(user._id)}
                                                    disabled={actionLoading}
                                                >
                                                    Vô hiệu hóa
                                                </button>
                                            )}

                                            <button
                                                className="text-red-600 hover:text-red-900"
                                                onClick={() => handleDeleteUser(user._id)}
                                                disabled={actionLoading}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && users.length > 0 && (
                    <div className="py-4 px-6 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;