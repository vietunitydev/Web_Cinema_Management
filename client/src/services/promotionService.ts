// src/services/promotionService.ts
import api from './api';
import type {ApiResponse, PaginatedResponse, Promotion} from '../types/models';

export interface PromotionCheckResult {
    data: Promotion;
    discountAmount: number;
    finalAmount: number;
}

export interface CheckCouponRequest {
    couponCode: string;
    totalAmount: number;
    movieId?: string;
    cinemaId?: string;
}

export const promotionService = {
    getAllPromotions: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Promotion>>>('/promotions', {
            params: { page, limit }
        }),

    getAllPromotionsWithRole: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Promotion>>>('/promotions/permission', {
            params: { page, limit }
        }),

    getPromotionById: (id: string) =>
        api.get<ApiResponse<Promotion>>(`/promotions/${id}`),

    checkCoupon: (request: CheckCouponRequest) =>
        api.post<ApiResponse<PromotionCheckResult>>('/promotions/check-coupon', request),

    getPromotionByCouponCode: (couponCode: string) =>
        api.get<ApiResponse<Promotion>>(`/promotions/coupon/${couponCode}`),

    // Admin/Manager methods
    createPromotion: (promotionData: Omit<Promotion, '_id'>) =>
        api.post<ApiResponse<Promotion>>('/promotions', promotionData),

    updatePromotion: (id: string, promotionData: Partial<Promotion>) =>
        api.patch<ApiResponse<Promotion>>(`/promotions/${id}`, promotionData),

    deletePromotion: (id: string) =>
        api.delete<ApiResponse<null>>(`/promotions/${id}`),

    updateAllPromotionsStatus: () =>
        api.patch<ApiResponse<{updated: number}>>('/promotions/update-status'),
};