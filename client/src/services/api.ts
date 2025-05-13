import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';


// Tạo đối tượng axios instance với cấu hình chung
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4999/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Cho phép gửi cookies khi có request tới API
});

// Interceptor cho request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho response
// apiClient.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     async (error) => {
//         const originalRequest = error.config;
//
//         // Kiểm tra nếu lỗi là 401 (Unauthorized) và chưa thử refresh token
//         if (error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;
//
//             try {
//                 // Gọi API để refresh token
//                 const response = await apiClient.post('/auth/refresh-token');
//                 const { token } = response.data;
//
//                 // Lưu token mới vào localStorage
//                 localStorage.setItem('token', token);
//
//                 // Cập nhật Authorization header
//                 originalRequest.headers.Authorization = `Bearer ${token}`;
//
//                 // Gửi lại request ban đầu với token mới
//                 return apiClient(originalRequest);
//             } catch (refreshError) {
//                 // Nếu refresh token thất bại, đăng xuất người dùng
//                 localStorage.removeItem('token');
//                 localStorage.removeItem('user');
//                 window.location.href = '/login';
//                 return Promise.reject(refreshError);
//             }
//         }
//
//         return Promise.reject(error);
//     }
// );

// Hàm wrapper xử lý API request tiện lợi
const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.get<T>(url, config).then(response => response.data),

    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.post<T>(url, data, config).then(response => response.data),

    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.put<T>(url, data, config).then(response => response.data),

    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.patch<T>(url, data, config).then(response => response.data),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.delete<T>(url, config).then(response => response.data),
};

export default api;