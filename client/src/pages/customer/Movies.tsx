// src/pages/customer/Movies.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { movieService, type MovieFilters } from '../../services/movieService';
import {type Movie } from '../../types/models';
import MovieCard from '../../components/common/MovieCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const Movies: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isComingSoon = location.pathname.includes('coming-soon');
    const isTopRated = location.pathname.includes('top-rated');

    // Parse query params
    const searchParams = new URLSearchParams(location.search);
    const initialPage = parseInt(searchParams.get('page') || '1', 10);
    const initialGenre = searchParams.get('genre') || '';
    const initialQuery = searchParams.get('query') || '';

    // State
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [selectedGenre, setSelectedGenre] = useState(initialGenre);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [genres, setGenres] = useState<string[]>([]);
    const [tempSearchQuery, setTempSearchQuery] = useState(initialQuery);

    const itemsPerPage = 12;

    // Fetch movies based on filters
    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            setError(null);

            try {
                let response;
                const filters: MovieFilters = {
                    page: currentPage,
                    limit: itemsPerPage,
                    genre: selectedGenre || undefined,
                };

                // Determine which API endpoint to call based on the route
                if (isComingSoon) {
                    response = await movieService.getComingSoon(currentPage, itemsPerPage);
                } else if (isTopRated) {
                    response = await movieService.getTopRated(currentPage, itemsPerPage);
                } else if (searchQuery) {
                    response = await movieService.searchMovies(searchQuery, currentPage, itemsPerPage);
                } else {
                    response = await movieService.getAllMovies(filters);
                }

                // Update state with fetched data
                if (response.data) {
                    setMovies(response.data.data);
                    setTotalItems(response.data.totalCount);
                    setTotalPages(response.data.totalPages);
                }
            } catch{
                setError('Không thể tải danh sách phim. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();

        // Update URL with current filters
        const params = new URLSearchParams();
        if (currentPage > 1) params.set('page', currentPage.toString());
        if (selectedGenre) params.set('genre', selectedGenre.toString());
        if (searchQuery) params.set('query', searchQuery);

        const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        navigate(newUrl, { replace: true });
    }, [currentPage, selectedGenre, searchQuery, isComingSoon, isTopRated, location.pathname]);

    useEffect(() => {
       const setGen = () => {
            // Extract unique genres from movies for filter
            if (movies.length > 0 && genres.length === 0) {
                const uniqueGenres = Array.from(
                    new Set(movies.flatMap(movie => movie.genre))
                ).sort();
                setGenres(uniqueGenres);
            }
       }

       setGen();
    }, [movies]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // Handle genre filter change
    const handleGenreChange = (genre: string) => {
        setSelectedGenre(genre === selectedGenre ? '' : genre);
        setCurrentPage(1);
    };

    // Handle search form submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(tempSearchQuery);
        setCurrentPage(1);
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedGenre('');
        setSearchQuery('');
        setTempSearchQuery('');
        setCurrentPage(1);
    };

    // Determine the page title based on the route
    const getPageTitle = () => {
        if (isComingSoon) return 'Phim sắp chiếu';
        if (isTopRated) return 'Phim đánh giá cao';
        if (searchQuery) return `Kết quả tìm kiếm: "${searchQuery}"`;
        return 'Tất cả phim';
    };

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{getPageTitle()}</h1>

                    {/* Search and Filter Bar */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm phim..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                        value={tempSearchQuery}
                                        onChange={(e) => setTempSearchQuery(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </form>

                            {/* Genre Filter */}
                            <div className="flex-shrink-0">
                                <select
                                    className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    value={selectedGenre}
                                    onChange={(e) => handleGenreChange(e.target.value)}
                                >
                                    <option value="">Tất cả thể loại</option>
                                    {genres.map((genre) => (
                                        <option key={genre} value={genre}>
                                            {genre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            {(selectedGenre || searchQuery) && (
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={clearFilters}
                                    className="flex-shrink-0"
                                >
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Movies Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                ) : movies.length === 0 ? (
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
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy phim nào</h3>
                        <p className="mt-1 text-gray-500">
                            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.
                        </p>
                        <div className="mt-6">
                            <Button variant="primary" onClick={clearFilters}>
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {movies.map((movie) => (
                            <MovieCard key={movie._id} movie={movie} showStatus={true} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && movies.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                    />
                )}
            </div>
        </div>
    );
};

export default Movies;