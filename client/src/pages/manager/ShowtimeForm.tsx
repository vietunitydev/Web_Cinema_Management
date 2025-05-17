// src/pages/manager/ShowtimeForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showtimeService } from '../../services/showtimeService';
import { movieService } from '../../services/movieService';
import { cinemaService } from '../../services/cinemaService';
import type { Movie, Cinema, Hall, Showtime } from '../../types/models';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

interface ErrorState {
    formData: string | null,
    movies: string | null,
    cinemas: string | null,
    submit: string | null,
}

const ShowtimeForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Get ID from URL if editing
    const navigate = useNavigate();
    const isEditing = !!id;

    // Form data
    const [formData, setFormData] = useState({
        movieId: '',
        cinemaId: '',
        hallId: '',
        startTime: '',
        endTime: '',
        language: '',
        subtitles: [''],
        format: '2D',
        price: {
            regular: 0,
            vip: 0,
            student: 0,
        },
        status: 'open',
    });

    // State for options and loading
    const [movies, setMovies] = useState<Movie[]>([]);
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [halls, setHalls] = useState<Hall[]>([]);
    const [loading, setLoading] = useState({
        formData: false,
        movies: true,
        cinemas: true,
        submit: false,
    });
    const [error, setError] = useState<ErrorState>({
        formData: null,
        movies: null,
        cinemas: null,
        submit: null,
    });

    // Fetch movies and cinemas when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {

                const moviesResponse = await movieService.getAllMovies();
                console.log("1");

                console.log(moviesResponse.data);
                setMovies(moviesResponse.data?.data || []);
                setError((prev) => ({ ...prev, movies: null }));
            } catch {
                setError((prev) => ({ ...prev, movies: 'Không thể tải danh sách phim' }));
            } finally {
                setLoading((prev) => ({ ...prev, movies: false }));
            }

            try {
                const cinemasResponse = await cinemaService.getAllCinemas();
                console.log("2");
                console.log(cinemasResponse.data);

                setCinemas(cinemasResponse.data?.data || []);
                setError((prev) => ({ ...prev, cinemas: null }));
            } catch {
                setError((prev) => ({ ...prev, cinemas: 'Không thể tải danh sách rạp' }));
            } finally {
                setLoading((prev) => ({ ...prev, cinemas: false }));
            }
        };

        fetchData();
    }, []);

    // Fetch halls when cinema is selected
    useEffect(() => {
        const fetchHalls = async () => {
            if (!formData.cinemaId) {
                setHalls([]);
                return;
            }

            try {
                const hallsResponse = await cinemaService.getCinemaHalls(formData.cinemaId);
                console.log("3");
                console.log(hallsResponse.data);
                setHalls(hallsResponse.data || []);
            } catch{
                toast.error('Không thể tải danh sách phòng chiếu');
            }
        };

        fetchHalls();
    }, [formData.cinemaId]);

    // Fetch showtime details if editing
    useEffect(() => {
        const fetchShowtime = async () => {
            if (!isEditing) return;

            setLoading((prev) => ({ ...prev, formData: true }));
            try {
                const response = await showtimeService.getShowtimeById(id!);
                console.log("4");
                console.log(response);
                const showtime = response.data;

                if (!showtime) {
                    setError((prev) => ({ ...prev, formData: 'Không tìm thấy lịch chiếu' }));
                    return;
                }

                // Format dates to local datetime-local input format
                const startTime = new Date(showtime.startTime);
                const endTime = new Date(showtime.endTime);

                setFormData({
                    movieId: showtime.movieId,
                    cinemaId: showtime.cinemaId,
                    hallId: showtime.hallId,
                    startTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
                    endTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
                    language: showtime.language,
                    subtitles: showtime.subtitles,
                    format: showtime.format,
                    price: {
                        regular: showtime.price.regular,
                        vip: showtime.price.vip || 0,
                        student: showtime.price.student || 0,
                    },
                    status: showtime.status,
                });

                setError((prev) => ({ ...prev, formData: null }));
            } catch {
                setError((prev) => ({ ...prev, formData: 'Không thể tải thông tin lịch chiếu' }));
            } finally {
                setLoading((prev) => ({ ...prev, formData: false }));
            }
        };

        fetchShowtime();
    }, [id, isEditing]);

    // Handle form field changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.startsWith('price.')) {
            const priceField = name.split('.')[1];
            setFormData({
                ...formData,
                price: {
                    ...formData.price,
                    [priceField]: parseInt(value) || 0,
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    // Handle select changes
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle subtitles changes
    const handleSubtitlesChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newSubtitles = [...formData.subtitles];
        newSubtitles[index] = e.target.value;
        setFormData({
            ...formData,
            subtitles: newSubtitles,
        });
    };

    // Add new subtitle field
    const addSubtitle = () => {
        setFormData({
            ...formData,
            subtitles: [...formData.subtitles, ''],
        });
    };

    // Remove subtitle field
    const removeSubtitle = (index: number) => {
        if (formData.subtitles.length > 1) {
            const newSubtitles = [...formData.subtitles];
            newSubtitles.splice(index, 1);
            setFormData({
                ...formData,
                subtitles: newSubtitles,
            });
        }
    };

    // Calculate end time based on movie duration
    const calculateEndTime = () => {
        if (!formData.movieId || !formData.startTime) return;

        const selectedMovie = movies.find((movie) => movie._id === formData.movieId);
        if (!selectedMovie) return;

        const startTime = new Date(formData.startTime);
        const endTime = new Date(startTime.getTime() + selectedMovie.duration * 60000); // Add duration in milliseconds

        setFormData({
            ...formData,
            endTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
        });
    };

    // Effect to auto-calculate end time when movie or start time changes
    useEffect(() => {
        calculateEndTime();
    }, [formData.movieId, formData.startTime]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate the form
        if (!formData.movieId || !formData.cinemaId || !formData.hallId || !formData.startTime || !formData.endTime) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        // Clean the subtitles array (remove empty strings)
        const cleanedSubtitles = formData.subtitles.filter((subtitle) => subtitle.trim() !== '');

        // Prepare the data
        const showtime: Partial<Showtime> = {
            ...formData,
            subtitles: cleanedSubtitles,
        };

        setLoading((prev) => ({ ...prev, submit: true }));
        setError((prev) => ({ ...prev, submit: null }));

        try {
            if (isEditing) {
                // Update existing showtime
                await showtimeService.updateShowtime(id!, showtime);
                toast.success('Cập nhật lịch chiếu thành công');
            } else {
                // Create new showtime
                await showtimeService.createShowtime(showtime as Omit<Showtime, '_id'>);
                toast.success('Tạo lịch chiếu mới thành công');
            }
            navigate('/manager/showtimes');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            setError((prev) => ({ ...prev, submit: errorMessage }));
            toast.error(errorMessage);
        } finally {
            setLoading((prev) => ({ ...prev, submit: false }));
        }
    };

    // Show loading when initially fetching showtime data
    if (isEditing && loading.formData) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Show error if couldn't fetch showtime data
    if (isEditing && error.formData) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">{error.formData}</h2>
                <Button variant="primary" onClick={() => navigate('/manager/showtimes')}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditing ? 'Chỉnh sửa lịch chiếu' : 'Tạo lịch chiếu mới'}
                </h1>
                <p className="text-gray-600">
                    {isEditing ? 'Cập nhật thông tin lịch chiếu' : 'Thêm lịch chiếu mới vào hệ thống'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Movie Selection */}
                <div className="mb-6">
                    <label htmlFor="movieId" className="block text-sm font-medium text-gray-700 mb-1">
                        Phim <span className="text-red-500">*</span>
                    </label>
                    {loading.movies ? (
                        <div className="py-2">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : error.movies ? (
                        <div className="text-red-500 text-sm">{error.movies}</div>
                    ) : (
                        <select
                            id="movieId"
                            name="movieId"
                            value={formData.movieId}
                            onChange={handleSelectChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            <option value="">Chọn phim</option>
                            {movies.map((movie) => (
                                <option key={movie._id} value={movie._id}>
                                    {movie.title} ({movie.duration} phút)
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Cinema and Hall Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="cinemaId" className="block text-sm font-medium text-gray-700 mb-1">
                            Rạp <span className="text-red-500">*</span>
                        </label>
                        {loading.cinemas ? (
                            <div className="py-2">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : error.cinemas ? (
                            <div className="text-red-500 text-sm">{error.cinemas}</div>
                        ) : (
                            <select
                                id="cinemaId"
                                name="cinemaId"
                                value={formData.cinemaId}
                                onChange={handleSelectChange}
                                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="">Chọn rạp</option>
                                {cinemas.map((cinema) => (
                                    <option key={cinema._id} value={cinema._id}>
                                        {cinema.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label htmlFor="hallId" className="block text-sm font-medium text-gray-700 mb-1">
                            Phòng chiếu <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="hallId"
                            name="hallId"
                            value={formData.hallId}
                            onChange={handleSelectChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={!formData.cinemaId || halls.length === 0}
                            required
                        >
                            <option value="">Chọn phòng chiếu</option>
                            {halls.map((hall) => (
                                <option key={hall.hallId} value={hall.hallId}>
                                    {hall.name} ({hall.type})
                                </option>
                            ))}
                        </select>
                        {!formData.cinemaId && (
                            <p className="text-sm text-gray-500 mt-1">Chọn rạp trước để xem danh sách phòng chiếu</p>
                        )}
                    </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Thời gian bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            id="startTime"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Thời gian kết thúc <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            id="endTime"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                            readOnly
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Tự động tính dựa trên thời lượng phim
                        </p>
                    </div>
                </div>

                {/* Format and Language */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                            Định dạng <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="format"
                            name="format"
                            value={formData.format}
                            onChange={handleSelectChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            <option value="2D">2D</option>
                            <option value="3D">3D</option>
                            <option value="IMAX">IMAX</option>
                            <option value="4DX">4DX</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                            Ngôn ngữ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="language"
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Ví dụ: Tiếng Việt, Tiếng Anh..."
                            required
                        />
                    </div>
                </div>

                {/* Subtitles */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phụ đề</label>
                    {formData.subtitles.map((subtitle, index) => (
                        <div key={index} className="flex mb-2">
                            <input
                                type="text"
                                value={subtitle}
                                onChange={(e) => handleSubtitlesChange(e, index)}
                                className="flex-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder={`Phụ đề ${index + 1}`}
                            />
                            <button
                                type="button"
                                onClick={() => removeSubtitle(index)}
                                className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md"
                                disabled={formData.subtitles.length <= 1}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addSubtitle}
                        className="mt-2 text-primary hover:text-primary-dark flex items-center"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Thêm phụ đề
                    </button>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Giá vé</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="price.regular" className="block text-sm font-medium text-gray-700 mb-1">
                                Giá thường <span className="text-red-500">*</span>
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">₫</span>
                                </div>
                                <input
                                    type="number"
                                    id="price.regular"
                                    name="price.regular"
                                    value={formData.price.regular}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-gray-300 p-2 pl-8 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="price.vip" className="block text-sm font-medium text-gray-700 mb-1">
                                Giá VIP
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">₫</span>
                                </div>
                                <input
                                    type="number"
                                    id="price.vip"
                                    name="price.vip"
                                    value={formData.price.vip}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-gray-300 p-2 pl-8 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="price.student" className="block text-sm font-medium text-gray-700 mb-1">
                                Giá sinh viên
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">₫</span>
                                </div>
                                <input
                                    type="number"
                                    id="price.student"
                                    name="price.student"
                                    value={formData.price.student}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-gray-300 p-2 pl-8 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status */}
                {isEditing && (
                    <div className="mb-6">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleSelectChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="open">Đang mở</option>
                            <option value="canceled">Đã hủy</option>
                            <option value="sold_out">Hết vé</option>
                        </select>
                    </div>
                )}

                {/* Error message */}
                {error.submit && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
                        {error.submit}
                    </div>
                )}

                {/* Form actions */}
                <div className="flex justify-end space-x-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate('/manager/showtimes')}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={loading.submit}
                        disabled={loading.submit}
                    >
                        {isEditing ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ShowtimeForm;