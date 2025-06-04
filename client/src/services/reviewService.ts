// src/services/reviewService.ts
import api from './api';
import type { ApiResponse, PaginatedResponse, Review } from '../types/models';

export interface CreateReviewData {
    movieId: string;
    bookingId?: string;
    rating: number;
    title?: string;
    content: string;
}

export const reviewService = {
    getAllReviews: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Review>>>('/reviews', {
            params: { page, limit }
        }),

    getAllMovieReviews: (movieId : string,page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Review>>>('/reviews', {
            params: { movieId, page, limit }
        }),

    getUserReviews: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Review>>>('/reviews/myreviews', {
            params: { page, limit }
        }),

    getReviewById: (id: string) =>
        api.get<ApiResponse<Review>>(`/reviews/${id}`),

    createReview: (reviewData: CreateReviewData) =>
        api.post<ApiResponse<Review>>('/reviews', reviewData),

    updateReview: (id: string, reviewData: Partial<CreateReviewData>) =>
        api.patch<ApiResponse<Review>>(`/reviews/${id}`, reviewData),

    deleteReview: (id: string) =>
        api.delete<ApiResponse<null>>(`/reviews/${id}`),

    // Admin/Manager methods
    getPendingReviews: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Review>>>('/reviews/get/pending', {
            params: { page, limit }
        }),

    approveReview: (id: string) =>
        api.patch<ApiResponse<Review>>(`/reviews/${id}/approve`),

    rejectReview: (id: string) =>
        api.patch<ApiResponse<Review>>(`/reviews/${id}/reject`),
};