import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 0) return null;

    return (
        <div className="flex items-center justify-center space-x-8 mt-8 mb-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-6 py-2.5 rounded-xl border text-sm font-medium transition-all ${currentPage === 1
                        ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200'
                    }`}
            >
                Previous
            </button>

            <div className="flex items-center space-x-1 text-sm font-semibold text-gray-700">
                <span className="text-gray-500">Page</span>
                <span className="text-blue-600 px-1">{currentPage}</span>
                <span className="text-gray-500">of</span>
                <span className="ml-1">{totalPages || 1}</span>
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-6 py-2.5 rounded-xl border text-sm font-medium transition-all ${currentPage === totalPages || totalPages === 0
                        ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200'
                    }`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
