// src/services/promotionService.ts
import api from './api';
import type { ApiResponse, PaginatedResponse, Promotion } from '../types/models';

export interface PromotionCheckResult {
    valid: boolean;
    promotion?: Promotion;
    discountAmount?: number;
    message?: string;
}

export const promotionService = {
    getAllPromotions: (page = 1, limit = 10) =>
        api.get<ApiResponse<PaginatedResponse<Promotion>>>('/promotions', {
            params: { page, limit }
        }),

    getPromotionById: (id: string) =>
        api.get<ApiResponse<Promotion>>(`/promotions/${id}`),

    checkCoupon: (couponCode: string, amount: number) =>
        api.post<ApiResponse<PromotionCheckResult>>('/promotions/check-coupon', {
            couponCode, amount
        }),

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