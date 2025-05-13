// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mb-6">
                        <h1 className="text-9xl font-bold text-primary">404</h1>
                        <h2 className="text-2xl font-semibold text-gray-900 mt-4">Không tìm thấy trang</h2>
                        <p className="mt-2 text-gray-600">
                            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <Link to="/">
                            <Button variant="primary" fullWidth>
                                Quay lại trang chủ
                            </Button>
                        </Link>
                        <div>
                            <button
                                onClick={() => window.history.back()}
                                className="text-primary hover:text-primary-dark font-medium"
                            >
                                Quay lại trang trước
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;