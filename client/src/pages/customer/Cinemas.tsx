// src/pages/customer/Cinemas.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cinemaService } from '../../services/cinemaService';
import type { Cinema } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

const Cinemas: React.FC = () => {
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [filteredCinemas, setFilteredCinemas] = useState<Cinema[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState('all');
    const [cities, setCities] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const itemsPerPage = 6;

    // Fetch cinemas on component mount
    useEffect(() => {
        const fetchCinemas = async () => {
            setLoading(true);
            try {
                const response = await cinemaService.getAllCinemas();
                const cinemasList = response.data?.data || [];
                setCinemas(cinemasList);

                // Extract unique cities
                const uniqueCities = Array.from(
                    new Set(cinemasList.map((cinema) => cinema.location.city))
                ).sort();
                setCities(uniqueCities);

                setError(null);
            } catch (err) {
                setError('Không thể tải danh sách rạp. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchCinemas();
    }, []);

    // Filter cinemas based on search term and city
    useEffect(() => {
        let result = [...cinemas];

        // Filter by city
        if (selectedCity !== 'all') {
            result = result.filter((cinema) => cinema.location.city === selectedCity);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (cinema) =>
                    cinema.name.toLowerCase().includes(term) ||
                    cinema.location.address.toLowerCase().includes(term)
            );
        }

        setFilteredCinemas(result);
        setTotalItems(result.length);
        setTotalPages(Math.ceil(result.length / itemsPerPage));
        setCurrentPage(1); // Reset to first page when filters change
    }, [cinemas, searchTerm, selectedCity]);

    // Get current page items
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCinemas.slice(startIndex, startIndex + itemsPerPage);
    };

    return (
        <div className="bg-white">
            <div className="bg-secondary text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Rạp chiếu phim</h1>
                    <p className="text-xl">Tìm rạp chiếu phim gần bạn</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filter Section */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="col-span-2">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Tìm theo tên hoặc địa chỉ..."
                                    className="w-full rounded-md border border-gray-300 p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* City Filter */}
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                Thành phố
                            </label>
                            <select
                                id="city"
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                            >
                                <option value="all">Tất cả thành phố</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Cinemas List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                ) : filteredCinemas.length === 0 ? (
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy rạp nào</h3>
                        <p className="mt-1 text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getCurrentPageItems().map((cinema) => (
                                <Link
                                    key={cinema._id}
                                    to={`/cinemas/${cinema._id}`}
                                    className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-md"
                                >
                                    <div className="h-48 bg-gray-300">
                                        {/* If you have cinema images, use them here */}
                                        <div className="h-full w-full flex items-center justify-center bg-secondary text-white">
                                            <span className="text-2xl font-bold">{cinema.name}</span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-2">{cinema.name}</h3>
                                        <p className="text-gray-600 mb-2">{cinema.location.address}</p>
                                        <p className="text-gray-600 mb-2">{cinema.location.city}</p>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <svg
                                                className="h-4 w-4 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span>
                        {cinema.openTime} - {cinema.closeTime}
                      </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <svg
                                                className="h-4 w-4 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                />
                                            </svg>
                                            <span>{cinema.contactInfo.phone}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cinemas;