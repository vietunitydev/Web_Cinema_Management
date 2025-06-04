// src/services/bookingService.ts
import api from './api';
import type { ApiResponse, PaginatedResponse, Booking } from '../types/models';

export interface CreateBookingData {
    showtimeId: string;
    seats: string[];
    promotionCode?: string;
    paymentMethod: string;
}

export interface BookingStats {
    totalRevenue: number;
    totalBookings: number;
    totalTickets: number;
}

export interface DailyStats extends BookingStats {
    date: string;
}

export interface MovieStats extends BookingStats {
    movieId: string;
    movieTitle: string;
}

export interface CinemaStats extends BookingStats {
    cinemaId: string;
    cinemaName: string;
}

export const bookingService = {
    // Create new booking
    createBooking: (bookingData: CreateBookingData) =>
        api.post<ApiResponse<Booking>>('/bookings', bookingData),

    // Get all bookings (Admin/Manager)
    getAllBookings: (page = 1, limit = 10, filters?: Record<string, any>) =>
        api.get<ApiResponse<PaginatedResponse<Booking>>>('/bookings', {
            params: { page, limit, ...filters }
        }),

    // Get booking by ID
    getBookingById: (id: string) =>
        api.get<ApiResponse<Booking>>(`/bookings/${id}`),

    // Update booking status (Admin/Manager)
    updateBookingStatus: (id: string, status: string) =>
        api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status }),

    verifyBookingId: (bookingId: string) =>
        api.get<ApiResponse<{ booking: Booking; verification: { status: string; message: string; verifiedAt: string } }>>(
            `/verify/booking/${bookingId}`
        ),

    // Verify booking code (Admin/Manager)
    verifyBookingCode: (bookingCode: string) =>
        api.get<ApiResponse<{ booking: Booking; verification: { status: string; message: string; verifiedAt: string } }>>(
            `/verify/booking-code/${bookingCode}`
        ),

    // Get user's bookings
    getMyBookings: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Booking>>>('/users/mybookings', {
            params: { page, limit }
        }),

    // Get user's bookings by user ID (Admin/Manager)
    getUserBookings: (userId: string, page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Booking>>>(`/users/${userId}/bookings`, {
            params: { page, limit }
        }),

    // Statistics
    getDailyStats: (startDate?: string, endDate?: string) =>
        api.get<ApiResponse<DailyStats[]>>('/bookings/stats/daily', {
            params: { startDate, endDate }
        }),

    getMovieStats: (startDate?: string, endDate?: string) =>
        api.get<ApiResponse<MovieStats[]>>('/bookings/stats/movies', {
            params: { startDate, endDate }
        }),

    getCinemaStats: (startDate?: string, endDate?: string) =>
        api.get<ApiResponse<CinemaStats[]>>('/bookings/stats/cinemas', {
            params: { startDate, endDate }
        }),

    // Cancel booking (if allowed)
    cancelBooking: (id: string) =>
        api.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`),
};