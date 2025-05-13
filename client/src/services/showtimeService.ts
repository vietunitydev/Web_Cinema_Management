// src/services/showtimeService.ts
import api from './api';
import type { ApiResponse, PaginatedResponse, Showtime } from '../types/models';

export interface ShowtimeFilters {
    cinema?: string;
    movie?: string;
    date?: string;
    status?: 'open' | 'canceled' | 'sold_out';
    page?: number;
    limit?: number;
}

export const showtimeService = {
    getAllShowtimes: (filters?: ShowtimeFilters) =>
        api.get<ApiResponse<PaginatedResponse<Showtime>>>('/showtimes', {
            params: filters
        }),

    getShowtimesByDate: (date: string, page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Showtime>>>(`/showtimes/date/${date}`, {
            params: { page, limit }
        }),

    getShowtimeById: (id: string) =>
        api.get<ApiResponse<Showtime>>(`/showtimes/${id}`),

    getShowtimeSeats: (id: string) =>
        api.get<ApiResponse<{availableSeats: string[], bookedSeats: string[]}>>(`/showtimes/${id}/seats`),

    // Admin/Manager methods
    createShowtime: (showtimeData: Omit<Showtime, '_id'>) =>
        api.post<ApiResponse<Showtime>>('/showtimes', showtimeData),

    updateShowtime: (id: string, showtimeData: Partial<Showtime>) =>
        api.patch<ApiResponse<Showtime>>(`/showtimes/${id}`, showtimeData),

    deleteShowtime: (id: string) =>
        api.delete<ApiResponse<null>>(`/showtimes/${id}`),

    cancelShowtime: (id: string) =>
        api.patch<ApiResponse<Showtime>>(`/showtimes/${id}/cancel`),
};