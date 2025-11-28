import React from 'react';

interface PaginationProps {
    total: number;
    current: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}
import styles from './index.module.scss';

const PaginationIndicator: React.FC<PaginationProps> = ({ total, current, pageSize, onPageChange }) => {
    const totalPages = Math.ceil(total / pageSize);

    const renderPageNumbers = () => {
        const pages = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else if (current < 5) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        } else if (current > totalPages - 4) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 4; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push('...');
            for (let i = current - 1; i <= current + 1; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== current) {
            onPageChange(page);
        }
    };

    return (
        <div className={styles.pagination}>
            <button
                onClick={() => handlePageChange(current - 1)}
                disabled={current === 1}
                className={styles.previousButton}
            >
                {"<"}
            </button>
            {
                renderPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {typeof page === 'number' ? (
                            <button
                                onClick={() => handlePageChange(page)}
                                className={current === page ? styles.active : ''}
                            >
                                {page}
                            </button>
                        ) : (
                            <button
                                className={styles.ellipsis}
                                onClick={() => {
                                    handlePageChange(Number(((Number(renderPageNumbers()[index - 1]) + Number(renderPageNumbers()[index + 1])) / 2).toFixed(0)))
                                }}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))
            }
            <button
                onClick={() => handlePageChange(current + 1)}
                disabled={current === totalPages}
                className={styles.nextButton}
            >
                {">"}
            </button>
        </div>
    );
};

export default PaginationIndicator;