import api from './api';
import type { ApiResponse, Movie, PaginatedResponse, Review, Showtime, MovieOption } from '../types/models';
import type {AxiosRequestConfig} from "axios";

export interface MovieFilters {
    title?: string;
    genre?: string;
    status?: 'active' | 'coming_soon' | 'ended';
    page?: number;
    limit?: number;
    sort?: string;
}

export const movieService = {
    getAllMovies: (filters?: MovieFilters) =>
        api.get<ApiResponse<PaginatedResponse<Movie>>>('/movies', { params: filters }),

    getNowPlaying: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Movie>>>('/movies/now-playing', {
            params: { page, limit }
        }),

    getComingSoon: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Movie>>>('/movies/coming-soon', {
            params: { page, limit }
        }),

    getTopRated: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Movie>>>('/movies/top-rated', {
            params: { page, limit }
        }),

    getMovieOptions: () =>
        api.get<ApiResponse<MovieOption[]>>('/movies/options'),

    searchMovies: (query: string, page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Movie>>>('/movies/search', {
            params: { query, page, limit }
        }),

    getMovieById: (id: string) =>
        api.get<ApiResponse<Movie>>(`/movies/${id}`),

    getMovieShowtimes: (movieId: string, date?: string) =>
        api.get<ApiResponse<Showtime[]>>(`/movies/${movieId}/showtimes`, {
            params: { date }
        }),

    getMovieShowtimesByCinema: (movieId: string, cinemaId: string, date?: string) =>
        api.get<ApiResponse<Showtime[]>>(`/movies/${movieId}/cinemas/${cinemaId}/showtimes`, {
            params: { date }
        }),

    getMovieReviews: (movieId: string, page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Review>>>(`/movies/${movieId}/reviews`, {
            params: { page, limit }
        }),

    // Admin/Manager methods
    createMovie: (movieData: Omit<Movie, '_id'>) =>
        api.post<ApiResponse<Movie>>('/movies', movieData),

    createMovieWithFile: (formData: FormData, config?: AxiosRequestConfig) =>
        api.post<ApiResponse<Movie>>('/movies/with-file', formData, {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'multipart/form-data',
            },
        }),

    updateMovie: (id: string, movieData: Partial<Movie>) =>
        api.patch<ApiResponse<Movie>>(`/movies/${id}`, movieData),

    updateMovieWithFile: (id: string, formData: FormData, config?: AxiosRequestConfig) =>
        api.patch<ApiResponse<Movie>>(`/movies/${id}/with-file`, formData, {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'multipart/form-data',
            },
        }),

    deleteMovie: (id: string) =>
        api.delete<ApiResponse<null>>(`/movies/${id}`),
};