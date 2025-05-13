// src/pages/customer/Home.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../../services/movieService';
import { type Movie } from '../../types/models';
import MovieCard from '../../components/common/MovieCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

interface ErrorState
{
    nowPlaying: string | null,
    comingSoon: string | null,
    topRated: string | null,
}

const Home: React.FC = () => {
    const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
    const [comingSoonMovies, setComingSoonMovies] = useState<Movie[]>([]);
    const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState({
        nowPlaying: true,
        comingSoon: true,
        topRated: true,
    });
    const [error, setError] = useState<ErrorState>({
        nowPlaying: null,
        comingSoon: null,
        topRated: null,
    });

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                // Fetch now playing movies
                const nowPlayingResponse = await movieService.getNowPlaying();
                setNowPlayingMovies(nowPlayingResponse.data?.data || []);
                setLoading((prev) => ({ ...prev, nowPlaying: false }));
            } catch {
                setError((prev) => ({ ...prev, nowPlaying: 'Không thể tải phim đang chiếu' }));
                setLoading((prev) => ({ ...prev, nowPlaying: false }));
            }

            try {
                // Fetch coming soon movies
                const comingSoonResponse = await movieService.getComingSoon();
                setComingSoonMovies(comingSoonResponse.data?.data || []);
                setLoading((prev) => ({ ...prev, comingSoon: false }));
            } catch {
                setError((prev) => ({ ...prev, comingSoon: 'Không thể tải phim sắp chiếu' }));
                setLoading((prev) => ({ ...prev, comingSoon: false }));
            }

            try {
                // Fetch top rated movies
                const topRatedResponse = await movieService.getTopRated();
                setTopRatedMovies(topRatedResponse.data?.data || []);
                setLoading((prev) => ({ ...prev, topRated: false }));
            } catch {
                setError((prev) => ({ ...prev, topRated: 'Không thể tải phim đánh giá cao' }));
                setLoading((prev) => ({ ...prev, topRated: false }));
            }
        };

        fetchMovies();
    }, []);

    // Get featured movie (first from now playing if available)
    const featuredMovie = nowPlayingMovies[0];

    return (
        <div>
            {/* Hero Banner with Featured Movie */}
            {featuredMovie && (
                <div className="relative">
                    <div className="h-[60vh] md:h-[70vh] overflow-hidden">
                        <div
                            className="absolute inset-0 bg-center bg-cover"
                            style={{
                                backgroundImage: `url(${featuredMovie.posterUrl})`,
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 absolute inset-0 flex flex-col justify-center text-white">
                        <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 mb-4 bg-primary text-white text-sm font-medium rounded-full">
                Phim nổi bật
              </span>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">{featuredMovie.title}</h1>
                            <div className="flex items-center mb-4">
                <span className="bg-yellow-500 text-yellow-900 text-xs font-medium px-2 py-0.5 rounded mr-2">
                  IMDb {featuredMovie.rating.toFixed(1)}
                </span>
                                <span className="mr-2">{featuredMovie.duration} phút</span>
                                <span className="mr-2">•</span>
                                <span className="mr-2">{featuredMovie.genre.join(', ')}</span>
                                <span className="mr-2">•</span>
                                <span>{featuredMovie.ageRestriction}</span>
                            </div>
                            <p className="text-gray-300 mb-6 line-clamp-3">{featuredMovie.description}</p>
                            <div className="space-x-4">
                                <Link to={`/movies/${featuredMovie._id}`}>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        }
                                    >
                                        Xem chi tiết
                                    </Button>
                                </Link>
                                <Link to={`/movies/${featuredMovie._id}/showtimes`}>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        }
                                    >
                                        Đặt vé ngay
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Now Playing Movies Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Phim đang chiếu</h2>
                        <Link
                            to="/movies"
                            className="text-primary hover:text-primary-dark flex items-center transition-colors"
                        >
                            Xem tất cả
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 ml-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Link>
                    </div>

                    {loading.nowPlaying ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : error.nowPlaying ? (
                        <div className="text-center py-8 text-red-500">{error.nowPlaying}</div>
                    ) : nowPlayingMovies.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Không có phim nào đang chiếu
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {nowPlayingMovies.slice(0, 5).map((movie) => (
                                <MovieCard key={movie._id} movie={movie} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Coming Soon Movies Section */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Phim sắp chiếu</h2>
                        <Link
                            to="/movies/coming-soon"
                            className="text-primary hover:text-primary-dark flex items-center transition-colors"
                        >
                            Xem tất cả
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 ml-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Link>
                    </div>

                    {loading.comingSoon ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : error.comingSoon ? (
                        <div className="text-center py-8 text-red-500">{error.comingSoon}</div>
                    ) : comingSoonMovies.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Không có phim nào sắp chiếu
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {comingSoonMovies.slice(0, 5).map((movie) => (
                                <MovieCard key={movie._id} movie={movie} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Top Rated Movies Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Phim đánh giá cao</h2>
                        <Link
                            to="/movies/top-rated"
                            className="text-primary hover:text-primary-dark flex items-center transition-colors"
                        >
                            Xem tất cả
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 ml-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Link>
                    </div>

                    {loading.topRated ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : error.topRated ? (
                        <div className="text-center py-8 text-red-500">{error.topRated}</div>
                    ) : topRatedMovies.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Không có phim nào đánh giá cao
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {topRatedMovies.slice(0, 5).map((movie) => (
                                <MovieCard key={movie._id} movie={movie} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Promotion Banner */}
            <section className="py-16 bg-secondary text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Đăng ký nhận ưu đãi đặc biệt
                        </h2>
                        <p className="text-xl md:text-2xl mb-8">
                            Nhận ngay ưu đãi giảm giá 10% cho lần đặt vé đầu tiên
                        </p>
                        <div className="flex flex-col md:flex-row max-w-lg mx-auto gap-4">
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                className="flex-1 px-4 py-3 rounded-md focus:outline-none text-gray-900"
                            />
                            <Button variant="primary" size="lg">
                                Đăng ký ngay
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;