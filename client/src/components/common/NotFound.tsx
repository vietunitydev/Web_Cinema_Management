// src/components/common/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

interface NotFoundProps {
    title?: string;
    message?: string;
    buttonText?: string;
    buttonLink?: string;
}

const NotFound: React.FC<NotFoundProps> = ({
                                               title = 'Không tìm thấy trang',
                                               message = 'Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.',
                                               buttonText = 'Quay lại trang chủ',
                                               buttonLink = '/',
                                           }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[60vh]">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">{message}</p>
                <Link to={buttonLink}>
                    <Button variant="primary" size="lg">
                        {buttonText}
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;