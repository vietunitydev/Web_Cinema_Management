// src/pages/customer/ShowtimeSelection.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { movieService } from '../../services/movieService';
import { cinemaService } from '../../services/cinemaService';
import type { Movie, Cinema, Showtime } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ErrorState
{
    movie: string | null,
    cinemas: string | null,
    showtimes: string | null,
}

const ShowtimeSelection: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Movie ID
    const [movie, setMovie] = useState<Movie | null>(null);
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [selectedCinema, setSelectedCinema] = useState<string>('all');
    const [loading, setLoading] = useState({
        movie: true,
        cinemas: true,
        showtimes: true,
    });
    const [error, setError] = useState<ErrorState>({
        movie: null,
        cinemas: null,
        showtimes: null,
    });

    // Generate an array of dates for the next 7 days
    const dateOptions = Array.from({ length: 7 }, (_, index) => {
        const date = addDays(new Date(), index);
        return {
            value: date.toISOString().split('T')[0],
            label: format(date, 'E, dd/MM', { locale: vi }),
            isToday: index === 0,
        };
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            // Fetch movie details
            try {
                const response = await movieService.getMovieById(id);
                setMovie(response.data ?? null);
                setLoading((prev) => ({ ...prev, movie: false }));
            } catch {
                setError((prev) => ({ ...prev, movie: 'Không thể tải thông tin phim' }));
                setLoading((prev) => ({ ...prev, movie: false }));
            }

            // Fetch all cinemas
            try {
                const response = await cinemaService.getAllCinemas();
                setCinemas(response.data?.data || []);
                setLoading((prev) => ({ ...prev, cinemas: false }));
            } catch {
                setError((prev) => ({ ...prev, cinemas: 'Không thể tải danh sách rạp' }));
                setLoading((prev) => ({ ...prev, cinemas: false }));
            }
        };

        fetchData();
    }, [id]);

    // Fetch showtimes when date or cinema selection changes
    useEffect(() => {
        const fetchShowtimes = async () => {
            if (!id) return;

            setLoading((prev) => ({ ...prev, showtimes: true }));
            setError((prev) => ({ ...prev, showtimes: null }));

            try {
                let response;

                if (selectedCinema === 'all') {
                    // Get all showtimes for the movie on the selected date
                    response = await movieService.getMovieShowtimes(id, selectedDate);
                } else {
                    // Get showtimes for the movie at a specific cinema on the selected date
                    response = await movieService.getMovieShowtimesByCinema(
                        id,
                        selectedCinema,
                        selectedDate
                    );
                }

                setShowtimes(response.data || []);
                setLoading((prev) => ({ ...prev, showtimes: false }));
            } catch {
                setError((prev) => ({ ...prev, showtimes: 'Không thể tải lịch chiếu' }));
                setLoading((prev) => ({ ...prev, showtimes: false }));
            }
        };

        fetchShowtimes();
    }, [id, selectedDate, selectedCinema]);

    // Group showtimes by cinema and format
    const groupedShowtimes = showtimes.reduce<{
        [cinemaId: string]: {
            cinemaName: string;
            address: string;
            formats: {
                [format: string]: Showtime[];
            };
        };
    }>((acc, showtime) => {
        // Skip if the cinema information is not available
        if (!showtime.cinema) return acc;

        const cinemaId = showtime.cinema._id;
        const cinemaName = showtime.cinema.name;
        const address = showtime.cinema.location.address;
        const format = showtime.format;

        // Initialize cinema group if it doesn't exist
        if (!acc[cinemaId]) {
            acc[cinemaId] = {
                cinemaName,
                address,
                formats: {},
            };
        }

        // Initialize format group if it doesn't exist
        if (!acc[cinemaId].formats[format]) {
            acc[cinemaId].formats[format] = [];
        }

        // Add showtime to the appropriate group
        acc[cinemaId].formats[format].push(showtime);

        return acc;
    }, {});

    // Format time from ISO string
    const formatTime = (timeString: string) => {
        const date = new Date(timeString);
        return format(date, 'HH:mm');
    };

    if (loading.movie) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error.movie || !movie) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    {error.movie || 'Không tìm thấy phim'}
                </h2>
                <p className="mb-8">Không thể tải thông tin phim. Vui lòng thử lại sau.</p>
                <Link to="/movies">
                    <Button variant="primary">Xem phim khác</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Movie Information Bar */}
            <div className="bg-secondary text-white py-4">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center">
                        <div className="flex items-center mb-2 md:mb-0">
                            <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden mr-4">
                                <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">{movie.title}</h1>
                                <div className="text-sm text-gray-300">
                                    <span>{movie.duration} phút</span>
                                    <span className="mx-2">•</span>
                                    <span>{movie.ageRestriction}</span>
                                    <span className="mx-2">•</span>
                                    <span>{movie.genre.join(', ')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="md:ml-auto mt-2 md:mt-0">
                            <Link to={`/movies/${movie._id}`}>
                                <Button variant="outline" size="sm">
                                    Chi tiết phim
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6">Chọn suất chiếu</h2>

                {/* Filters Section */}
                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Date Selection */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn ngày
                            </label>
                            <div className="grid grid-cols-7 gap-2">
                                {dateOptions.map((date) => (
                                    <button
                                        key={date.value}
                                        className={`p-2 text-center rounded-md transition-colors ${
                                            selectedDate === date.value
                                                ? 'bg-primary text-white'
                                                : 'bg-white border border-gray-300 hover:bg-gray-100'
                                        }`}
                                        onClick={() => setSelectedDate(date.value)}
                                    >
                                        <div className="text-xs">{date.label.split(',')[0]}</div>
                                        <div className="font-medium">
                                            {date.label.split(',')[1]}
                                            {date.isToday && (
                                                <div className="text-xs font-light">Hôm nay</div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cinema Selection */}
                        <div className="md:w-72">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn rạp
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                value={selectedCinema}
                                onChange={(e) => setSelectedCinema(e.target.value)}
                            >
                                <option value="all">Tất cả rạp</option>
                                {cinemas.map((cinema) => (
                                    <option key={cinema._id} value={cinema._id}>
                                        {cinema.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Showtimes Section */}
                {loading.showtimes ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error.showtimes ? (
                    <div className="text-center py-8 text-red-500">{error.showtimes}</div>
                ) : Object.keys(groupedShowtimes).length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
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
                        <h3 className="mt-2 text-lg font-medium text-gray-900">
                            Không có suất chiếu nào
                        </h3>
                        <p className="mt-1 text-gray-500">
                            Không tìm thấy suất chiếu nào cho phim này vào ngày đã chọn.
                        </p>
                        <div className="mt-6">
                            <Button
                                variant="primary"
                                onClick={() => setSelectedDate(dateOptions[0].value)}
                            >
                                Xem ngày khác
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedShowtimes).map(([cinemaId, cinema]) => (
                            <div key={cinemaId} className="bg-gray-50 rounded-lg overflow-hidden">
                                <div className="bg-secondary text-white px-6 py-4">
                                    <h3 className="text-lg font-semibold">{cinema.cinemaName}</h3>
                                    <p className="text-sm text-gray-300">{cinema.address}</p>
                                </div>
                                <div className="p-6">
                                    {Object.entries(cinema.formats).map(([format, showtimes]) => (
                                        <div key={format} className="mb-6 last:mb-0">
                                            <h4 className="text-md font-medium mb-3 flex items-center">
                        <span className="inline-block px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-md mr-2">
                          {format}
                        </span>
                                                {format === '2D' && 'Định dạng 2D'}
                                                {format === '3D' && 'Định dạng 3D'}
                                                {format === 'IMAX' && 'Định dạng IMAX'}
                                                {format === '4DX' && 'Định dạng 4DX'}
                                            </h4>
                                            <div className="flex flex-wrap gap-3">
                                                {showtimes
                                                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                                    .map((showtime) => (
                                                        <Link
                                                            key={showtime._id}
                                                            to={`/showtimes/${showtime._id}/seats`}
                                                            className={`px-4 py-2 rounded-md text-center min-w-[70px] ${
                                                                showtime.status === 'open'
                                                                    ? 'bg-white shadow hover:shadow-md border border-gray-200 hover:border-primary transition-all'
                                                                    : showtime.status === 'sold_out'
                                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                                        : 'bg-red-100 text-red-500 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <div className="font-medium">
                                                                {formatTime(showtime.startTime)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                ~ {formatTime(showtime.endTime)}
                                                            </div>
                                                        </Link>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowtimeSelection;