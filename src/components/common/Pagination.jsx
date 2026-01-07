import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-center space-x-2 mt-8 mb-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-all ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                    }`}
            >
                <FiChevronLeft className="w-5 h-5" />
            </button>

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 rounded-lg border font-medium transition-all ${currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-all ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                    }`}
            >
                <FiChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Pagination;
