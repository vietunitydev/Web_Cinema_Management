// src/services/authService.ts
import api from './api';
import type { ApiResponse, User } from '../types/models';

interface LoginResponse {
    user: User;
    token: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
}

export const authService = {
    login: (username: string, password: string) =>
        api.post<ApiResponse<LoginResponse>>('/auth/login', { username, password }),

    register: (userData: RegisterData) =>
        api.post<ApiResponse<User>>('/auth/register', userData),

    logout: () =>
        api.get<ApiResponse<null>>('/auth/logout'),

    getCurrentUser: () =>
        api.get<ApiResponse<User>>('/auth/me'),

    updateProfile: (userData: Partial<User>) =>
        api.patch<ApiResponse<User>>('/auth/updateme', userData),

    updatePassword: (currentPassword: string, newPassword: string) =>
        api.patch<ApiResponse<null>>('/auth/updatepassword', {
            currentPassword,
            newPassword,
        }),
};