

import React from 'react';
import Image from 'next/image';
import Card from '../card';
import PaginationIndicator from '../PaginationIndicator';
import { useTranslation } from 'next-i18next';
import styles from './newList.module.scss';
import { useRouter } from 'next/router';
import { formatDate } from '@/utils/tool';


interface NewsListProps {
    newsList: API.NewsListItem[];
    loading: boolean;
    page: number;
    total: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
}

const NewsList: React.FC<NewsListProps> = ({
    newsList,
    loading,
    page,
    total,
    pageSize = 9,
    onPageChange,
}) => {
    const { t } = useTranslation("common");
    const { locale } = useRouter();

    return (
        <div className={styles.news_list}>
            {loading && (
                <div className={styles.loading}>
                    <Image
                        src='/images/icons/loading.svg'
                        alt="loading"
                        width={120}
                        height={200}
                        className={styles.loadingIcon}
                    />
                    <div className={styles.text}>{t('common.loadingText')}</div>
                </div>
            )}
            {!loading && newsList.length === 0 && (
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
            {!loading && newsList.length > 0 && (
                <div className={styles.news_list_wrapper}>
                    {
                        newsList.map((item) => (
                            <Card
                                key={item.id}
                                title={locale === 'zh' ? item.titleZh : item.titleEn}
                                text={formatDate(Number(item.createdAt) * 1000)}
                                imgSrc={item.coverUrl}
                            />
                        ))
                    }
                </div>
            )}
            {!loading && newsList.length > 0 && page && total && (
                <div className={styles.pagination}>
                    <PaginationIndicator
                        current={page}
                        total={total}
                        pageSize={pageSize}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default NewsList;