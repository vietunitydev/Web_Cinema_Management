// src/services/userService.ts
import api from './api';
import type { ApiResponse, Booking, PaginatedResponse, User } from '../types/models';

export const userService = {
    // Admin methods
    getAllUsers: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<User>>>('/users', {
            params: { page, limit }
        }),

    getUserById: (id: string) =>
        api.get<ApiResponse<User>>(`/users/${id}`),

    createUser: (userData: Omit<User, '_id' | 'registrationDate'>) =>
        api.post<ApiResponse<User>>('/users', userData),

    updateUser: (id: string, userData: Partial<User>) =>
        api.patch<ApiResponse<User>>(`/users/${id}`, userData),

    deleteUser: (id: string) =>
        api.delete<ApiResponse<null>>(`/users/${id}`),

    deactivateUser: (id: string) =>
        api.patch<ApiResponse<User>>(`/users/${id}/deactivate`),

    activateUser: (id: string) =>
        api.patch<ApiResponse<User>>(`/users/${id}/activate`),

    getUserBookings: (userId: string, page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Booking>>>(`/users/${userId}/bookings`, {
            params: { page, limit }
        }),
};