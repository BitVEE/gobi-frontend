import React from 'react';
import styles from './index.module.scss';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import PaginationIndicator from '../PaginationIndicator';

// 定义表格列和数据的类型
interface TableColumn {
    title: string;
    dataIndex: string;
    key: string;
    render?: (text: string, record: any) => React.ReactNode;
}


interface TableProps {
    columns: TableColumn[];
    dataSource: Record<string, any>[];
    pagination?: {
        total: number;
        current: number;
        pageSize: number;
    };
    rowKey: string;
    loading: boolean;
    setPage: (page: number) => void;
}

const TableComponent: React.FC<TableProps> = ({ columns, dataSource, pagination, rowKey, loading, setPage }) => {
    const { t } = useTranslation("common");
    return (
        <div className={styles.tableContainer}>
            {loading && <div className={styles.loading}>
                <Image
                    src='/images/icons/loading.svg'
                    alt="loading"
                    width={120}
                    height={200}
                    className={styles.loadingIcon}
                />
                <div className={styles.text}>{t('common.loadingText')}</div>
            </div>}
            {!loading && dataSource.length === 0 && (
                <div className={styles.nodata}>
                    <Image
                        src='/images/icons/nodata.svg'
                        alt="nodata"
                        width={365}
                        height={300}
                        className={styles.nodataIcon}
                    />
                    <div className={styles.text}>{t('common.nodataText')}</div>
                </div>
            )}
            {!loading && dataSource.length !== 0 && (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} className={styles.tableHeader}>
                                    {column.title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataSource.map((row) => (
                            <tr key={row[rowKey]} className={styles.tableRow}>
                                {columns.map((column) => (
                                    <td key={`${row[rowKey]}-${column.key}`} className={styles.tableCell}>
                                        {column.render?.(row[column.dataIndex], row) ?? row[column.dataIndex]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {pagination?.total && (
                <PaginationIndicator total={pagination?.total || 0} current={pagination?.current || 0} pageSize={pagination?.pageSize || 0} onPageChange={setPage} />
            )}
        </div>
    );
};

export default TableComponent;