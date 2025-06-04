// src/pages/customer/CinemaDetail.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cinemaService } from '../../services/cinemaService';
// import { showtimeService } from '../../services/showtimeService';
import type { Cinema, Showtime } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

const CinemaDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [cinema, setCinema] = useState<Cinema | null>(null);
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [loading, setLoading] = useState({
        cinema: true,
        showtimes: true,
    });
    const [error, setError] = useState({
        cinema: null,
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
        const fetchCinema = async () => {
            if (!id) return;

            try {
                const response = await cinemaService.getCinemaById(id);
                setCinema(response.data);
                setLoading((prev) => ({ ...prev, cinema: false }));
            } catch (err) {
                setError((prev) => ({ ...prev, cinema: 'Không thể tải thông tin rạp chiếu phim' }));
                setLoading((prev) => ({ ...prev, cinema: false }));
            }
        };

        fetchCinema();
    }, [id]);

    useEffect(() => {
        const fetchShowtimes = async () => {
            if (!id) return;

            setLoading((prev) => ({ ...prev, showtimes: true }));
            try {
                const response = await cinemaService.getCinemaShowtimes(id, selectedDate);
                setShowtimes(response.data || []);
                setLoading((prev) => ({ ...prev, showtimes: false }));
            } catch (err) {
                setError((prev) => ({ ...prev, showtimes: 'Không thể tải lịch chiếu' }));
                setLoading((prev) => ({ ...prev, showtimes: false }));
            }
        };

        fetchShowtimes();
    }, [id, selectedDate]);

    // Group showtimes by movie and format
    const groupedShowtimes = Array.isArray(showtimes) ? showtimes.reduce<{
        [movieId: string]: {
            movie: {
                _id: string;
                title: string;
                posterUrl: string;
                duration: number;
            };
            formats: {
                [format: string]: Showtime[];
            };
        };
    }>((acc, showtime) => {
        if (!showtime.movie) return acc;

        const movieId = showtime.movie._id;
        const format = showtime.format;

        // Initialize movie group if it doesn't exist
        if (!acc[movieId]) {
            acc[movieId] = {
                movie: {
                    _id: showtime.movie._id,
                    title: showtime.movie.title,
                    posterUrl: showtime.movie.posterUrl,
                    duration: showtime.movie.duration,
                },
                formats: {},
            };
        }

        // Initialize format group if it doesn't exist
        if (!acc[movieId].formats[format]) {
            acc[movieId].formats[format] = [];
        }

        // Add showtime to the appropriate group
        acc[movieId].formats[format].push(showtime);

        return acc;
    }, {}) : {};

    // Format time from ISO string
    const formatTime = (timeString: string) => {
        const date = new Date(timeString);
        return format(date, 'HH:mm');
    };

    if (loading.cinema) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error.cinema || !cinema) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    {error.cinema || 'Không tìm thấy rạp chiếu phim'}
                </h2>
                <p className="mb-8">Không thể tải thông tin rạp. Vui lòng thử lại sau.</p>
                <Link to="/cinemas">
                    <Button variant="primary">Quay lại danh sách rạp</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Cinema Banner with Info */}
            <div className="bg-secondary text-white py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">{cinema.name}</h1>
                    <p className="text-xl mb-4">{cinema.location.address}, {cinema.location.city}</p>

                    <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center">
                            <svg
                                className="h-5 w-5 mr-2"
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
                            <span>Giờ mở cửa: {cinema.openTime} - {cinema.closeTime}</span>
                        </div>

                        <div className="flex items-center">
                            <svg
                                className="h-5 w-5 mr-2"
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
                            <span>Liên hệ: {cinema.contactInfo.phone}</span>
                        </div>

                        <div className="flex items-center">
                            <svg
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            <span>Email: {cinema.contactInfo.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Cinema Facilities */}
                {cinema.facilities && cinema.facilities.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Tiện ích</h2>
                        <div className="flex flex-wrap gap-2">
                            {cinema.facilities.map((facility, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 rounded-full text-gray-800 text-sm"
                                >
                                    {facility}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cinema Halls */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Phòng chiếu</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cinema.halls.map((hall) => (
                            <div
                                key={hall.hallId}
                                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                            >
                                <h3 className="font-bold text-lg mb-2">{hall.name}</h3>
                                <p className="text-gray-600 mb-1">
                                    Loại: <span className="font-medium">{hall.type}</span>
                                </p>
                                <p className="text-gray-600 mb-1">
                                    Sức chứa: <span className="font-medium">{hall.capacity} ghế</span>
                                </p>
                                <p className="text-gray-600">
                                    Sơ đồ: <span className="font-medium">{hall.seatingArrangement.rows} hàng × {hall.seatingArrangement.seatsPerRow} ghế</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Showtimes Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Lịch chiếu</h2>

                    {/* Date Selection */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn ngày
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                            {dateOptions.map((date) => (
                                <button
                                    key={date.value}
                                    className={`p-2 text-center rounded-md transition-colors ${selectedDate === date.value
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

                    {/* Showtimes List */}
                    {loading.showtimes ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : error.showtimes ? (
                        <div className="text-center py-6 text-red-500">{error.showtimes}</div>
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
                                Không tìm thấy suất chiếu nào cho rạp này vào ngày đã chọn.
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
                            {Object.values(groupedShowtimes).map((item) => (
                                <div key={item.movie._id} className="bg-gray-50 rounded-lg overflow-hidden">
                                    <div className="flex items-center p-4 border-b border-gray-200">
                                        <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden mr-4">
                                            <img
                                                src={item.movie.posterUrl}
                                                alt={item.movie.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">
                                                <Link
                                                    to={`/movies/${item.movie._id}`}
                                                    className="hover:text-primary"
                                                >
                                                    {item.movie.title}
                                                </Link>
                                            </h3>
                                            <p className="text-gray-600 text-sm">{item.movie.duration} phút</p>
                                        </div>
                                        <div className="ml-auto">
                                            <Link to={`/movies/${item.movie._id}`}>
                                                <Button variant="outline" size="sm">Xem chi tiết</Button>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        {Object.entries(item.formats).map(([format, showtimes]) => (
                                            <div key={format} className="mb-4 last:mb-0">
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
                                                                className={`px-4 py-2 rounded-md text-center min-w-[70px] ${showtime.status === 'open'
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

            {/* Map and Direction */}
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold mb-6">Vị trí & Chỉ đường</h2>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Bản đồ sẽ được hiển thị ở đây khi tích hợp Google Maps API</p>
                        </div>
                        <div className="mt-4 p-4 border-t border-gray-100">
                            <h3 className="font-bold mb-2">Địa chỉ:</h3>
                            <p className="text-gray-700">{cinema.location.address}, {cinema.location.city}</p>
                            <div className="mt-4">
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(cinema.location.address + ', ' + cinema.location.city)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                                >
                                    Xem trên Google Maps
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CinemaDetail;