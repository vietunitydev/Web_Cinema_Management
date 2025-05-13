// src/components/common/Pagination.tsx
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({
                                                   currentPage,
                                                   totalPages,
                                                   onPageChange,
                                                   totalItems,
                                                   itemsPerPage,
                                               }) => {
    const pageNumbers = [];

    // Generate array of page numbers to be displayed
    if (totalPages <= 5) {
        // If total pages is less than or equal to 5, show all pages
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        // Always show first page
        pageNumbers.push(1);

        // Show dots if current page is > 3
        if (currentPage > 3) {
            pageNumbers.push('...');
        }

        // Show current page and one before and after if possible
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        // Show dots if current page is < totalPages - 2
        if (currentPage < totalPages - 2) {
            pageNumbers.push('...');
        }

        // Always show last page
        if (totalPages > 1) {
            pageNumbers.push(totalPages);
        }
    }

    return (
        <div className="flex flex-col items-center my-4">
            {/* Pagination Info */}
            {totalItems !== undefined && itemsPerPage !== undefined && (
                <div className="text-sm text-gray-700 mb-2">
                    Hiển thị <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> đến{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> trong{' '}
                    <span className="font-medium">{totalItems}</span> kết quả
                </div>
            )}

            {/* Pagination Buttons */}
            <div className="inline-flex mt-2 space-x-1">
                {/* Previous Page */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                        currentPage === 1
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                    Trước
                </button>

                {/* Page Numbers */}
                {pageNumbers.map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-4 py-2 text-sm text-gray-700">...</span>
                        ) : (
                            <button
                                onClick={() => typeof page === 'number' && onPageChange(page)}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                    currentPage === page
                                        ? 'bg-primary text-white'
                                        : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                {/* Next Page */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                        currentPage === totalPages || totalPages === 0
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                    Tiếp
                </button>
            </div>
        </div>
    );
};

export default Pagination;