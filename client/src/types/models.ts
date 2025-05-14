// src/types/models.ts
export interface User {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    registrationDate: string;
    role: 'customer' | 'manager' | 'admin';
    preferences?: {
        favoriteGenres?: string[];
    };
    isActive? : boolean;
}

export interface Movie {
    _id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    releaseDate: string;
    endDate?: string;
    director: string;
    cast: string[];
    genre: string[];
    language: string;
    subtitles: string[];
    ageRestriction: string;
    posterUrl: string;
    trailerUrl?: string;
    rating: number;
    status: 'active' | 'coming_soon' | 'ended';
    tags?: string[];
}

export interface Cinema {
    _id: string;
    name: string;
    location: {
        address: string;
        city: string;
    };
    contactInfo: {
        phone: string;
        email: string;
    };
    facilities?: string[];
    openTime: string;
    closeTime: string;
    halls: Hall[];
}

export interface Hall {
    hallId: string;
    name: string;
    capacity: number;
    type: string; // Regular, VIP, IMAX, 4DX
    seatingArrangement: {
        rows: number;
        seatsPerRow: number;
        format: string[][]; // Detailed seating map
    };
}

export interface Showtime {
    _id: string;
    movieId: string;
    movie?: Movie; // Populated reference
    cinemaId: string;
    cinema?: Cinema; // Populated reference
    hallId: string;
    startTime: string;
    endTime: string;
    language: string;
    subtitles: string[];
    format: string; // 2D, 3D, IMAX, 4DX
    price: {
        regular: number;
        vip?: number;
        student?: number;
    };
    availableSeats: string[];
    bookedSeats: string[];
    status: 'open' | 'canceled' | 'sold_out';
}

export interface Booking {
    _id: string;
    userId: string;
    user?: User; // Populated reference
    showtimeId: string;
    showtime?: Showtime; // Populated reference
    movieId: string;
    movie?: Movie; // Populated reference
    cinemaId: string;
    cinema?: Cinema; // Populated reference
    hallId: string;
    bookingTime: string;
    seats: string[];
    totalAmount: number;
    discount?: {
        amount: number;
    };
    finalAmount: number;
    paymentMethod: string;
    paymentId?: string;
    status: 'pending' | 'confirmed' | 'canceled';
    bookingCode?: string;
}

export interface Review {
    _id: string;
    userId: string;
    user?: User; // Populated reference
    movieId: string;
    movie?: Movie; // Populated reference
    bookingId?: string;
    rating: number;
    title?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    likes?: number;
    status: 'pending' | 'approved' | 'rejected';
}

export interface Promotion {
    _id: string;
    name: string;
    description: string;
    type: 'percentage' | 'fixed_amount' | 'buy_one_get_one';
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    applicableMovies?: string[]; // 'all' or specific movie IDs
    applicableCinemas?: string[]; // 'all' or specific cinema IDs
    applicableDaysOfWeek?: string[]; // 'all' or specific days
    couponCode: string;
    usageLimit: number;
    usageCount: number;
    status: 'active' | 'upcoming' | 'expired';
}

// API Response Types
export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    status: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}