// src/routes.tsx
import React from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ManagerLayout from './components/layout/ManagerLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Customer Pages
import Home from './pages/customer/Home';
import Movies from './pages/customer/Movies';
import MovieDetail from './pages/customer/MovieDetail';
import Cinemas from './pages/customer/Cinemas';
import CinemaDetail from './pages/customer/CinemaDetail';
import ShowtimeSelection from './pages/customer/ShowtimeSelection';
import SeatSelection from './pages/customer/SeatSelection';
import Checkout from './pages/customer/Checkout';
import BookingConfirmation from './pages/customer/BookingConfirmation';
import Profile from './pages/customer/Profile';
import BookingHistory from './pages/customer/BookingHistory';
import BookingDetail from './pages/customer/BookingDetail';
import Promotions from './pages/customer/Promotions';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerShowtimes from './pages/manager/Showtimes';
import ManagerShowtimeForm from './pages/manager/ShowtimeForm';
import ManagerHalls from './pages/manager/Halls';
import ManagerHallForm from './pages/manager/HallForm';
import ManagerReports from './pages/manager/Reports';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminMovies from './pages/admin/Movies';
import AdminMovieForm from './pages/admin/MovieForm';
import AdminUsers from './pages/admin/Users';
import AdminUserForm from './pages/admin/UserForm';
import AdminPromotions from './pages/admin/Promotions';
import AdminPromotionForm from './pages/admin/PromotionForm';
import AdminReports from './pages/admin/Reports';

// Error Pages
import NotFound from './pages/NotFound';

// Route guards
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'manager' | 'customer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                           children,
                                                           requiredRole
                                                       }) => {
    const { user, isLoading } = useAuth();

    // Show loading state if auth is still being checked
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // If user is not logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If route requires specific role and user doesn't have it
    if (requiredRole && user.role !== requiredRole) {
        // Redirect admin or manager to their dashboard if they try to access wrong area
        if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" />;
        }
        if (user.role === 'manager') {
            return <Navigate to="/manager/dashboard" />;
        }
        // Redirect regular user to home
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

// Routes configuration
export const routes: RouteObject[] = [
    // Public routes
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
    },
    {
        path: '/reset-password',
        element: <ResetPassword />,
    },

    // Customer routes
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/movies',
                element: <Movies />,
            },
            {
                path: '/movies/coming-soon',
                element: <Movies />,
            },
            {
                path: '/movies/:id',
                element: <MovieDetail />,
            },
            {
                path: '/cinemas',
                element: <Cinemas />,
            },
            {
                path: '/cinemas/:id',
                element: <CinemaDetail />,
            },
            {
                path: '/movies/:id/showtimes',
                element: <ShowtimeSelection />,
            },
            {
                path: '/showtimes/:id/seats',
                element: (
                    <ProtectedRoute>
                        <SeatSelection />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/checkout',
                element: (
                    <ProtectedRoute>
                        <Checkout />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/booking-confirmation/:id',
                element: (
                    <ProtectedRoute>
                        <BookingConfirmation />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/profile',
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/bookings',
                element: (
                    <ProtectedRoute>
                        <BookingHistory />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/bookings/:id',
                element: (
                    <ProtectedRoute>
                        <BookingDetail />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/promotions',
                element: <Promotions />,
            },
        ],
    },

    // Manager routes
    {
        path: '/manager',
        element: (
            <ProtectedRoute requiredRole="manager">
                <ManagerLayout>
                    <Navigate to="/manager/dashboard" />
                </ManagerLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/manager/dashboard',
        element: (
            <ProtectedRoute requiredRole="manager">
                <ManagerLayout>
                    <ManagerDashboard />
                </ManagerLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/manager/showtimes',
        element: (
            <ProtectedRoute requiredRole="manager">
                <ManagerLayout>
                    <ManagerShowtimes />
                </ManagerLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/manager/showtimes/create',
        element: (
            <ProtectedRoute requiredRole="manager">
                <ManagerLayout>
                    <ManagerShowtimeForm />
                </ManagerLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/manager/showtimes/:id/edit',
        element: (
            <ProtectedRoute requiredRole="manager">
                <ManagerLayout>
                    <ManagerShowtimeForm />
                </ManagerLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/manager/halls',
        element: (
            <ProtectedRoute requiredRole="manager">
                <ManagerLayout>
                    <ManagerHalls />
                </ManagerLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/manager/halls/create',
        element: (
            <ProtectedRoute requiredRole="manager">
                <ManagerLayout>
                    <ManagerHallForm />
                </ManagerLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/manager/halls/:id/edit',
        element: (
            <ProtectedRoute requiredRole="manager">
                <ManagerLayout>
                    <ManagerHallForm />
                </ManagerLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/manager/reports',
        element: (
            <ProtectedRoute requiredRole="manager">
                <ManagerLayout>
                    <ManagerReports />
                </ManagerLayout>
            </ProtectedRoute>
        ),
    },

    // Admin routes
    {
        path: '/admin',
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <Navigate to="/admin/dashboard" />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/dashboard',
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <AdminDashboard />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/movies',
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <AdminMovies />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/movies/create',
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <AdminMovieForm />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/movies/:id/edit',
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <AdminMovieForm />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/users',
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <AdminUsers />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/users/create',
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <AdminUserForm />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/users/:id/edit',
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <AdminUserForm />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/promotions',
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <AdminPromotions />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/promotions/create',
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <AdminPromotionForm />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/promotions/:id/edit',
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <AdminPromotionForm />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/reports',
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <AdminReports />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },

    // 404 route
    {
        path: '*',
        element: <NotFound />,
    },
];