// src/components/common/MovieCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { type Movie } from '../../types/models';

interface MovieCardProps {
    movie: Movie;
    showStatus?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, showStatus = false }) => {
    // Format rating stars
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <div className="flex">
                {/* Full stars */}
                {Array(fullStars)
                    .fill(0)
                    .map((_, i) => (
                        <svg
                            key={`full-${i}`}
                            className="w-4 h-4 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                    ))}

                {/* Half star */}
                {halfStar && (
                    <svg
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                )}

                {/* Empty stars */}
                {Array(emptyStars)
                    .fill(0)
                    .map((_, i) => (
                        <svg
                            key={`empty-${i}`}
                            className="w-4 h-4 text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                    ))}
            </div>
        );
    };

    // Status badge colors
    const statusColors = {
        active: 'bg-green-100 text-green-800',
        coming_soon: 'bg-blue-100 text-blue-800',
        ended: 'bg-gray-100 text-gray-800',
    };

    // Status text
    const statusText = {
        active: 'Đang chiếu',
        coming_soon: 'Sắp chiếu',
        ended: 'Đã kết thúc',
    };

    // Truncate genres if too long
    const displayGenres = () => {
        const genreString = movie.genre.join(', ');
        if (genreString.length > 25) {
            return genreString.substring(0, 25) + '...';
        }
        return genreString;
    };

    return (
        <div className="card overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
            <Link to={`/movies/${movie._id}`} className="block relative group flex-1 flex flex-col">
                {/* Status badge */}
                {showStatus && (
                    <span
                        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium z-10 ${
                            statusColors[movie.status]
                        }`}
                    >
                        {statusText[movie.status]}
                    </span>
                )}

                {/* Poster */}
                <div className="relative overflow-hidden aspect-[2/3]">
                    <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                    {/* Overlay with details on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                        <p className="text-sm line-clamp-3 mb-2">{movie.description}</p>
                        <div className="flex items-center justify-between">
                            <span>{movie.duration} phút</span>
                            <span>{movie.ageRestriction}</span>
                        </div>
                    </div>
                </div>

                {/* Movie info */}
                <div className="p-4 flex-1 flex flex-col">
                    {/* Title - fixed height */}
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 h-7" title={movie.title}>
                        {movie.title}
                    </h3>

                    {/* Rating and genre - fixed height */}
                    <div className="flex-1 min-h-12">
                        <div className="flex items-center mb-2">
                            {renderStars(movie.rating)}
                            <span className="ml-1 text-sm text-gray-600">{movie.rating.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-2" title={movie.genre.join(', ')}>
                            {displayGenres()}
                        </div>
                    </div>

                    {/* Call to action button - always at bottom */}
                    <div className="mt-4">
                        {movie.status === 'active' ? (
                            <div className="bg-primary hover:bg-primary-dark text-white text-center py-2 rounded-md transition-colors">
                                Đặt vé
                            </div>
                        ) : movie.status === 'coming_soon' ? (
                            <div className="bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded-md transition-colors">
                                Sắp ra mắt
                            </div>
                        ) : (
                            <div className="bg-gray-300 text-gray-700 text-center py-2 rounded-md">
                                Đã kết thúc
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default MovieCard;