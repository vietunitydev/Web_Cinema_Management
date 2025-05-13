// src/services/bookingService.ts
import api from './api';
import type { ApiResponse, Booking, PaginatedResponse } from '../types/models';

export interface CreateBookingData {
    showtimeId: string;
    seats: string[];
    promotionCode?: string;
    paymentMethod: string;
}

export interface BookingStats {
    totalRevenue: number;
    ticketsSold: number;
    averageTicketPrice: number;
    data: Array<{
        date?: string;
        movieId?: string;
        cinemaId?: string;
        count: number;
        revenue: number;
    }>;
}

export const bookingService = {
    createBooking: (bookingData: CreateBookingData) =>
        api.post<ApiResponse<Booking>>('/bookings', bookingData),

    getUserBookings: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Booking>>>('/users/mybookings', {
            params: { page, limit }
        }),

    getBookingById: (id: string) =>
        api.get<ApiResponse<Booking>>(`/bookings/${id}`),

    verifyBookingCode: (code: string) =>
        api.get<ApiResponse<Booking>>(`/bookings/verify/${code}`),

    // Admin/Manager methods
    getAllBookings: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Booking>>>('/bookings', {
            params: { page, limit }
        }),

    updateBookingStatus: (id: string, status: 'confirmed' | 'canceled') =>
        api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status }),

    getDailyStats: (startDate?: string, endDate?: string) =>
        api.get<ApiResponse<BookingStats>>('/bookings/stats/daily', {
            params: { startDate, endDate }
        }),

    getMovieStats: (startDate?: string, endDate?: string) =>
        api.get<ApiResponse<BookingStats>>('/bookings/stats/movies', {
            params: { startDate, endDate }
        }),

    getCinemaStats: (startDate?: string, endDate?: string) =>
        api.get<ApiResponse<BookingStats>>('/bookings/stats/cinemas', {
            params: { startDate, endDate }
        }),
};