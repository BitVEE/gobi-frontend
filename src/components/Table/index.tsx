import React from 'react';
import styles from './index.module.scss';
import Image from 'next/image';

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
}

const TableComponent: React.FC<TableProps> = ({ columns, dataSource, pagination, rowKey, loading }) => {
    return (
        <div className={styles.tableContainer}>
            {loading && <div className={styles.loading}>
                <div className={styles.loadingIcon}>
                    <Image
                        src='/images/icons/loading.svg'
                        alt="loading"
                        width={30}
                        height={30}
                        className={styles.spinner}
                    />
                </div>
            </div>}
            {!loading && dataSource.length === 0 && (
                <div className={styles.noData}>暂无数据</div>
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
        </div>
    );
};

export default TableComponent;