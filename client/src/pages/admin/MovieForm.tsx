// src/pages/admin/MovieForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { movieService } from '../../services/movieService';
import { type Movie } from '../../types/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

interface MovieFormValues {
    title: string;
    description: string;
    duration: number;
    releaseDate: string;
    endDate: string;
    director: string;
    cast: string;
    genre: string;
    language: string;
    subtitles: string;
    ageRestriction: string;
    posterUrl: string;
    trailerUrl: string;
    status: 'active' | 'coming_soon' | 'ended';
}

const MovieForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch movie details if editing
    useEffect(() => {
        const fetchMovie = async () => {
            if (!isEditing) return;

            try {
                const response = await movieService.getMovieById(id);
                if (response.data) {
                    setMovie(response.data);
                } else {
                    setError('Không tìm thấy thông tin phim');
                }
            } catch (err) {
                setError('Lỗi khi tải thông tin phim');
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [id, isEditing]);

    // Set up formik with validation
    const formik = useFormik<MovieFormValues>({
        initialValues: {
            title: '',
            description: '',
            duration: 0,
            releaseDate: '',
            endDate: '',
            director: '',
            cast: '',
            genre: '',
            language: '',
            subtitles: '',
            ageRestriction: '',
            posterUrl: '',
            trailerUrl: '',
            status: 'coming_soon',
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Vui lòng nhập tên phim'),
            description: Yup.string().required('Vui lòng nhập mô tả phim'),
            duration: Yup.number()
                .required('Vui lòng nhập thời lượng phim')
                .positive('Thời lượng phải là số dương')
                .integer('Thời lượng phải là số nguyên'),
            releaseDate: Yup.date().required('Vui lòng nhập ngày phát hành'),
            endDate: Yup.date().min(
                Yup.ref('releaseDate'),
                'Ngày kết thúc phải sau ngày phát hành'
            ),
            director: Yup.string().required('Vui lòng nhập tên đạo diễn'),
            cast: Yup.string().required('Vui lòng nhập tên diễn viên'),
            genre: Yup.string().required('Vui lòng chọn thể loại phim'),
            language: Yup.string().required('Vui lòng nhập ngôn ngữ phim'),
            ageRestriction: Yup.string().required('Vui lòng chọn giới hạn độ tuổi'),
            posterUrl: Yup.string().url('URL không hợp lệ').required('Vui lòng nhập URL poster'),
            status: Yup.string().required('Vui lòng chọn trạng thái phim'),
        }),
        onSubmit: async (values) => {
            setSubmitting(true);

            try {
                const movieData = {
                    ...values,
                    cast: values.cast.split(',').map(name => name.trim()),
                    genre: values.genre.split(',').map(genre => genre.trim()),
                    subtitles: values.subtitles.split(',').map(subtitle => subtitle.trim()),
                };

                if (isEditing) {
                    await movieService.updateMovie(id, movieData);
                    toast.success('Cập nhật phim thành công');
                } else {
                    await movieService.createMovie(movieData as any); // Type cast needed here
                    toast.success('Thêm phim mới thành công');
                }

                navigate('/admin/movies');
            } catch (err) {
                toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Update form values when movie data is loaded
    useEffect(() => {
        if (movie) {
            formik.setValues({
                title: movie.title,
                description: movie.description,
                duration: movie.duration,
                releaseDate: new Date(movie.releaseDate).toISOString().split('T')[0],
                endDate: movie.endDate ? new Date(movie.endDate).toISOString().split('T')[0] : '',
                director: movie.director,
                cast: movie.cast.join(', '),
                genre: movie.genre.join(', '),
                language: movie.language,
                subtitles: movie.subtitles.join(', '),
                ageRestriction: movie.ageRestriction,
                posterUrl: movie.posterUrl,
                trailerUrl: movie.trailerUrl || '',
                status: movie.status,
            });
        }
    }, [movie]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isEditing && error) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
                <Button variant="primary" onClick={() => navigate('/admin/movies')}>
                    Quay lại danh sách phim
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditing ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
                </h1>
                <p className="text-gray-600">
                    {isEditing
                        ? `Đang chỉnh sửa: ${movie?.title}`
                        : 'Điền thông tin chi tiết để thêm phim mới vào hệ thống'}
                </p>
            </div>

            <form onSubmit={formik.handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thông tin cơ bản */}
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
                    </div>

                    {/* Tên phim */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Tên phim <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className={`w-full rounded-md border ${
                                formik.touched.title && formik.errors.title
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập tên phim"
                            {...formik.getFieldProps('title')}
                        />
                        {formik.touched.title && formik.errors.title && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
                        )}
                    </div>

                    {/* Trạng thái */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="status"
                            name="status"
                            className={`w-full rounded-md border ${
                                formik.touched.status && formik.errors.status
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            {...formik.getFieldProps('status')}
                        >
                            <option value="coming_soon">Sắp chiếu</option>
                            <option value="active">Đang chiếu</option>
                            <option value="ended">Đã kết thúc</option>
                        </select>
                        {formik.touched.status && formik.errors.status && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.status}</p>
                        )}
                    </div>

                    {/* Mô tả phim */}
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả phim <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            className={`w-full rounded-md border ${
                                formik.touched.description && formik.errors.description
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập mô tả chi tiết về phim"
                            {...formik.getFieldProps('description')}
                        ></textarea>
                        {formik.touched.description && formik.errors.description && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
                        )}
                    </div>

                    {/* Poster URL */}
                    <div className="md:col-span-2">
                        <label htmlFor="posterUrl" className="block text-sm font-medium text-gray-700 mb-1">
                            URL Poster <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            id="posterUrl"
                            name="posterUrl"
                            className={`w-full rounded-md border ${
                                formik.touched.posterUrl && formik.errors.posterUrl
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập URL ảnh poster"
                            {...formik.getFieldProps('posterUrl')}
                        />
                        {formik.touched.posterUrl && formik.errors.posterUrl && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.posterUrl}</p>
                        )}
                        {formik.values.posterUrl && (
                            <div className="mt-2 flex items-center">
                                <img
                                    src={formik.values.posterUrl}
                                    alt="Poster preview"
                                    className="h-24 w-16 object-cover rounded"
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/160x240?text=Error')}
                                />
                                <span className="ml-2 text-sm text-gray-500">Xem trước poster phim</span>
                            </div>
                        )}
                    </div>

                    {/* Trailer URL */}
                    <div className="md:col-span-2">
                        <label htmlFor="trailerUrl" className="block text-sm font-medium text-gray-700 mb-1">
                            URL Trailer
                        </label>
                        <input
                            type="url"
                            id="trailerUrl"
                            name="trailerUrl"
                            className={`w-full rounded-md border ${
                                formik.touched.trailerUrl && formik.errors.trailerUrl
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập URL trailer (tùy chọn)"
                            {...formik.getFieldProps('trailerUrl')}
                        />
                        {formik.touched.trailerUrl && formik.errors.trailerUrl && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.trailerUrl}</p>
                        )}
                    </div>

                    {/* Thông tin chi tiết */}
                    <div className="md:col-span-2 border-t pt-6 mt-4">
                        <h2 className="text-xl font-semibold mb-4">Thông tin chi tiết</h2>
                    </div>

                    {/* Thời lượng */}
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                            Thời lượng (phút) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="duration"
                            name="duration"
                            min="1"
                            className={`w-full rounded-md border ${
                                formik.touched.duration && formik.errors.duration
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Ví dụ: 120"
                            {...formik.getFieldProps('duration')}
                        />
                        {formik.touched.duration && formik.errors.duration && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.duration}</p>
                        )}
                    </div>

                    {/* Giới hạn độ tuổi */}
                    <div>
                        <label htmlFor="ageRestriction" className="block text-sm font-medium text-gray-700 mb-1">
                            Giới hạn độ tuổi <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="ageRestriction"
                            name="ageRestriction"
                            className={`w-full rounded-md border ${
                                formik.touched.ageRestriction && formik.errors.ageRestriction
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            {...formik.getFieldProps('ageRestriction')}
                        >
                            <option value="">Chọn giới hạn độ tuổi</option>
                            <option value="P">P - Phim dành cho mọi đối tượng</option>
                            <option value="K">K - Phim dành cho khán giả dưới 13 tuổi</option>
                            <option value="C13">C13 - Phim cấm khán giả dưới 13 tuổi</option>
                            <option value="C16">C16 - Phim cấm khán giả dưới 16 tuổi</option>
                            <option value="C18">C18 - Phim cấm khán giả dưới 18 tuổi</option>
                        </select>
                        {formik.touched.ageRestriction && formik.errors.ageRestriction && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.ageRestriction}</p>
                        )}
                    </div>

                    {/* Đạo diễn */}
                    <div>
                        <label htmlFor="director" className="block text-sm font-medium text-gray-700 mb-1">
                            Đạo diễn <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="director"
                            name="director"
                            className={`w-full rounded-md border ${
                                formik.touched.director && formik.errors.director
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập tên đạo diễn"
                            {...formik.getFieldProps('director')}
                        />
                        {formik.touched.director && formik.errors.director && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.director}</p>
                        )}
                    </div>

                    {/* Diễn viên */}
                    <div>
                        <label htmlFor="cast" className="block text-sm font-medium text-gray-700 mb-1">
                            Diễn viên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="cast"
                            name="cast"
                            className={`w-full rounded-md border ${
                                formik.touched.cast && formik.errors.cast
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập tên diễn viên, phân cách bởi dấu phẩy"
                            {...formik.getFieldProps('cast')}
                        />
                        <p className="mt-1 text-xs text-gray-500">Ví dụ: Trấn Thành, Thu Trang, Lan Ngọc</p>
                        {formik.touched.cast && formik.errors.cast && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.cast}</p>
                        )}
                    </div>

                    {/* Thể loại */}
                    <div>
                        <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                            Thể loại <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="genre"
                            name="genre"
                            className={`w-full rounded-md border ${
                                formik.touched.genre && formik.errors.genre
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập thể loại, phân cách bởi dấu phẩy"
                            {...formik.getFieldProps('genre')}
                        />
                        <p className="mt-1 text-xs text-gray-500">Ví dụ: Hành động, Phiêu lưu, Kịch tính</p>
                        {formik.touched.genre && formik.errors.genre && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.genre}</p>
                        )}
                    </div>

                    {/* Ngôn ngữ */}
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                            Ngôn ngữ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="language"
                            name="language"
                            className={`w-full rounded-md border ${
                                formik.touched.language && formik.errors.language
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập ngôn ngữ chính của phim"
                            {...formik.getFieldProps('language')}
                        />
                        {formik.touched.language && formik.errors.language && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.language}</p>
                        )}
                    </div>

                    {/* Phụ đề */}
                    <div>
                        <label htmlFor="subtitles" className="block text-sm font-medium text-gray-700 mb-1">
                            Phụ đề
                        </label>
                        <input
                            type="text"
                            id="subtitles"
                            name="subtitles"
                            className={`w-full rounded-md border ${
                                formik.touched.subtitles && formik.errors.subtitles
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            placeholder="Nhập ngôn ngữ phụ đề, phân cách bởi dấu phẩy"
                            {...formik.getFieldProps('subtitles')}
                        />
                        <p className="mt-1 text-xs text-gray-500">Ví dụ: Tiếng Việt, Tiếng Anh</p>
                        {formik.touched.subtitles && formik.errors.subtitles && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.subtitles}</p>
                        )}
                    </div>

                    {/* Thời gian */}
                    <div>
                        <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày phát hành <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="releaseDate"
                            name="releaseDate"
                            className={`w-full rounded-md border ${
                                formik.touched.releaseDate && formik.errors.releaseDate
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            {...formik.getFieldProps('releaseDate')}
                        />
                        {formik.touched.releaseDate && formik.errors.releaseDate && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.releaseDate}</p>
                        )}
                    </div>

                    {/* Ngày kết thúc */}
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày kết thúc
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            className={`w-full rounded-md border ${
                                formik.touched.endDate && formik.errors.endDate
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary focus:border-primary'
                            } p-2 focus:outline-none focus:ring-2`}
                            {...formik.getFieldProps('endDate')}
                        />
                        <p className="mt-1 text-xs text-gray-500">Để trống nếu chưa xác định ngày kết thúc</p>
                        {formik.touched.endDate && formik.errors.endDate && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.endDate}</p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 mt-8">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate('/admin/movies')}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={submitting}
                        disabled={submitting || !formik.isValid}
                    >
                        {isEditing ? 'Cập nhật' : 'Thêm phim'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default MovieForm;