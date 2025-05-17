// src/services/cinemaService.ts
import api from './api';
import type { ApiResponse, Cinema, Hall, PaginatedResponse, Showtime, CinemaOption } from '../types/models';

export const cinemaService = {
    getAllCinemas: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Cinema>>>('/cinemas', {
            params: { page, limit }
        }),

    getCinemasByCity: (city: string, page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Cinema>>>(`/cinemas/city/${city}`, {
            params: { page, limit }
        }),

    getCinemaOptions: () =>
        api.get<ApiResponse<CinemaOption[]>>('/cinemas/options'),

    getCinemaById: (id: string) =>
        api.get<ApiResponse<Cinema>>(`/cinemas/${id}`),

    getCinemaHalls: (cinemaId: string) =>
        api.get<ApiResponse<Hall[]>>(`/cinemas/${cinemaId}/halls`),

    getHallById: (cinemaId: string, hallId: string) =>
        api.get<ApiResponse<Hall>>(`/cinemas/${cinemaId}/halls/${hallId}`),

    getCinemaShowtimes: (cinemaId: string, date?: string) =>
        api.get<ApiResponse<Showtime[]>>(`/cinemas/${cinemaId}/showtimes`, {
            params: { date }
        }),

    // Admin/Manager methods
    createCinema: (cinemaData: Omit<Cinema, '_id'>) =>
        api.post<ApiResponse<Cinema>>('/cinemas', cinemaData),

    updateCinema: (id: string, cinemaData: Partial<Cinema>) =>
        api.patch<ApiResponse<Cinema>>(`/cinemas/${id}`, cinemaData),

    deleteCinema: (id: string) =>
        api.delete<ApiResponse<null>>(`/cinemas/${id}`),

    createHall: (cinemaId: string, hallData: Omit<Hall, 'hallId'>) =>
        api.post<ApiResponse<Hall>>(`/cinemas/${cinemaId}/halls`, hallData),

    updateHall: (cinemaId: string, hallId: string, hallData: Partial<Hall>) =>
        api.patch<ApiResponse<Hall>>(`/cinemas/${cinemaId}/halls/${hallId}`, hallData),

    deleteHall: (cinemaId: string, hallId: string) =>
        api.delete<ApiResponse<null>>(`/cinemas/${cinemaId}/halls/${hallId}`),
};