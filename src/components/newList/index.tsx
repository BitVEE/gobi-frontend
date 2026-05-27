

import React from 'react';
import Image from 'next/image';
import Card from '../card';
import PaginationIndicator from '../PaginationIndicator';
import { useTranslation } from 'next-i18next';
import styles from './newList.module.scss';
import { useRouter } from 'next/router';
import { formatDate } from '@/utils/tool';


interface NewsListProps {
    showSchoolList?: boolean;
    newsList: API.NewsListItem[];
    loading: boolean;
    page?: number;
    total?: number;
    pageSize?: number;
    fromPage?: string;
    fromPageLabel?: string;
    onPageChange?: (page: number) => void;
    clickItem?: (id: number) => void;
}

const NewsList: React.FC<NewsListProps> = ({
    newsList,
    loading,
    page,
    total,
    pageSize = 9,
    fromPage = '首页',
    fromPageLabel = '新闻动态卡片',
    onPageChange,
    showSchoolList = true,
    clickItem = (id: number) => { },
}) => {
    const { t } = useTranslation("common");
    const { locale } = useRouter();

    const triggerYouMeng = (category: string, action: string, label: string) => {
        (window as any)._czc && (window as any)._czc.push(["_trackEvent", category, action, label]);
    }

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
                <div className={showSchoolList ? styles.news_list_wrapper : styles.news_list_wrapper_no_school}>
                    {
                        newsList.map((item) => (
                            <div onClick={() => triggerYouMeng(fromPage, '点击', fromPageLabel)} key={`${item.id}-${item.createdAt}`}>
                                <Card
                                    key={item.id}
                                    showSchoolList={showSchoolList}
                                    schoolList={item.schoolList}
                                    title={locale === 'zh' ? item.titleZh : item.titleEn}
                                    text={formatDate(Number(item.createdAt) * 1000)}
                                    imgSrc={item.coverUrl}
                                    link={showSchoolList ? item.type == 1 ? "/raceInfo/detail?id=" + item.id : "/raceImage/detail?id=" + item.id : ""}
                                    clickItem={() => clickItem(item.id)}
                                />
                            </div>
                        ))
                    }
                </div>
            )}
            {!loading && onPageChange && newsList.length > 0 && page && total && (
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